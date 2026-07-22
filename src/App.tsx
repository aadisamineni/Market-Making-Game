import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import { STARTING_BANKROLL } from './config/gameConfig';
import type { RoundHistoryEntry, RoundPositions, RoundResult } from './domain/types';
import { cryptoRandomSource } from './game/random';
import { createRoundBetDefinitions, type RoundBetDefinitions } from './game/rounds';
import { settleRound } from './game/settlement';
import { maximumRoundLoss, totalBinaryWagers } from './risk/risk';
import { formatSignedUsd, formatUsd } from './utils/format';
import { BettingTable } from './components/BettingTable';
import { History } from './components/History';
import { MarketPanel } from './components/MarketPanel';
import { OutcomePanels } from './components/OutcomePanels';
import { ResultsTable } from './components/ResultsTable';
import { RiskPanel } from './components/RiskPanel';
import './styles.css';

type StringMap = Record<string, string>;
type MarketInputs = { sellVolume: string; buyVolume: string };

const emptyWagers = (ids: string[]): StringMap => Object.fromEntries(ids.map((id) => [id, '']));

const initialDiceInputs = (definitions: RoundBetDefinitions) => emptyWagers(definitions.dice.map((definition) => definition.id));
const initialCoinInputs = (definitions: RoundBetDefinitions) => emptyWagers(definitions.coin.map((definition) => definition.id));
const initialCardInputs = (definitions: RoundBetDefinitions) => emptyWagers(definitions.cards.map((definition) => definition.id));
const initialMarketInputs = (): MarketInputs => ({ sellVolume: '', buyVolume: '' });

const wagerPattern = /^(\d+)?(\.\d{0,2})?$/;
const integerPattern = /^\d*$/;

const parseWagers = (inputs: StringMap): Record<string, number> =>
  Object.fromEntries(Object.entries(inputs).map(([id, value]) => [id, value.trim() === '' ? 0 : Number(value)]));

const parseMarket = (inputs: MarketInputs) => ({
  sellVolume: inputs.sellVolume.trim() === '' ? 0 : Number(inputs.sellVolume),
  buyVolume: inputs.buyVolume.trim() === '' ? 0 : Number(inputs.buyVolume),
});

const validateWagers = (inputs: StringMap): StringMap => {
  const errors: StringMap = {};
  for (const [id, value] of Object.entries(inputs)) {
    const trimmed = value.trim();
    if (trimmed === '') continue;
    if (!wagerPattern.test(trimmed) || trimmed === '.' || !Number.isFinite(Number(trimmed)) || Number(trimmed) < 0) {
      errors[id] = 'Use a nonnegative dollar amount with up to two decimals.';
    }
  }
  return errors;
};

const validateMarket = (inputs: MarketInputs): StringMap => {
  const errors: StringMap = {};
  for (const [field, value] of Object.entries(inputs)) {
    const trimmed = value.trim();
    if (trimmed === '') continue;
    if (!integerPattern.test(trimmed) || !Number.isFinite(Number(trimmed)) || Number(trimmed) < 0) {
      errors[field] = 'Use a nonnegative whole number.';
    }
  }
  return errors;
};

const hasAnyPosition = (positions: RoundPositions): boolean =>
  totalBinaryWagers(positions) > 0 || positions.market.sellVolume > 0 || positions.market.buyVolume > 0;

const toCsv = (history: RoundHistoryEntry[]): string => {
  const header = [
    'round',
    'dice',
    'coins',
    'cards',
    'card_product',
    'card_sum',
    'total_wagered',
    'sell_volume',
    'buy_volume',
    'round_pnl',
    'bankroll_after',
  ];
  const rows = history.map((entry) => [
    entry.roundNumber,
    `${entry.dice.die1}+${entry.dice.die2}=${entry.dice.sum}`,
    entry.coins.join(''),
    entry.cards.cards.map((card) => `${card.rank}${card.suit}`).join(' '),
    entry.cards.product,
    entry.cards.sum,
    entry.totalBinaryWagers.toFixed(2),
    entry.marketSettlement.sellVolume,
    entry.marketSettlement.buyVolume,
    entry.totalPnl.toFixed(2),
    entry.bankrollAfter.toFixed(2),
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
};

export default function App() {
  const [roundBets, setRoundBets] = useState(() => createRoundBetDefinitions(cryptoRandomSource));
  const [bankroll, setBankroll] = useState(STARTING_BANKROLL);
  const [cumulativePnl, setCumulativePnl] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [diceInputs, setDiceInputs] = useState(() => initialDiceInputs(roundBets));
  const [coinInputs, setCoinInputs] = useState(() => initialCoinInputs(roundBets));
  const [cardInputs, setCardInputs] = useState(() => initialCardInputs(roundBets));
  const [marketInputs, setMarketInputs] = useState(initialMarketInputs);
  const [lastResult, setLastResult] = useState<RoundResult | undefined>();
  const [history, setHistory] = useState<RoundHistoryEntry[]>([]);
  const [formMessage, setFormMessage] = useState('');
  const [animating, setAnimating] = useState(false);
  const submittedRound = useRef<number | undefined>(undefined);
  const wagerErrors = {
    ...validateWagers(diceInputs),
    ...validateWagers(coinInputs),
    ...validateWagers(cardInputs),
  };
  const marketErrors = validateMarket(marketInputs);
  const positions: RoundPositions = {
    diceWagers: parseWagers(diceInputs),
    coinWagers: parseWagers(coinInputs),
    cardWagers: parseWagers(cardInputs),
    market: parseMarket(marketInputs),
  };
  const currentWagers = totalBinaryWagers(positions);
  const riskTooLarge = maximumRoundLoss(positions) > bankroll;
  const hasValidationErrors = Object.keys(wagerErrors).length > 0 || Object.keys(marketErrors).length > 0;
  const canSubmit = !hasValidationErrors && hasAnyPosition(positions) && !riskTooLarge;

  const updateInput = (setter: Dispatch<SetStateAction<StringMap>>, id: string, value: string) => {
    setter((current) => ({ ...current, [id]: value }));
    setFormMessage('');
  };

  const handleSubmit = () => {
    if (submittedRound.current === roundNumber) {
      setFormMessage('This round has already been submitted. Enter positions for the next round.');
      return;
    }
    if (hasValidationErrors) {
      setFormMessage('Fix the highlighted inputs before submitting.');
      return;
    }
    if (!hasAnyPosition(positions)) {
      setFormMessage('Enter at least one wager or market volume before submitting.');
      return;
    }
    if (riskTooLarge) {
      setFormMessage('Maximum possible loss exceeds the current bankroll.');
      return;
    }

    submittedRound.current = roundNumber;
    setAnimating(true);
    window.setTimeout(() => setAnimating(false), 500);
    const result = settleRound(positions, cryptoRandomSource, roundNumber, bankroll, roundBets);
    const nextRoundBets = createRoundBetDefinitions(cryptoRandomSource);
    setLastResult(result);
    setHistory((entries) => [result, ...entries]);
    setBankroll(result.bankrollAfter);
    setCumulativePnl((value) => value + result.totalPnl);
    setRoundNumber((value) => value + 1);
    setRoundBets(nextRoundBets);
    setDiceInputs(initialDiceInputs(nextRoundBets));
    setCoinInputs(initialCoinInputs(nextRoundBets));
    setCardInputs(initialCardInputs(nextRoundBets));
    setMarketInputs(initialMarketInputs());
    setFormMessage(`Round ${roundNumber} settled: ${formatSignedUsd(result.totalPnl)}.`);
  };

  const resetGame = () => {
    if (!window.confirm('Reset the game and clear round history?')) return;
    setBankroll(STARTING_BANKROLL);
    setCumulativePnl(0);
    setRoundNumber(1);
    const nextRoundBets = createRoundBetDefinitions(cryptoRandomSource);
    setRoundBets(nextRoundBets);
    setDiceInputs(initialDiceInputs(nextRoundBets));
    setCoinInputs(initialCoinInputs(nextRoundBets));
    setCardInputs(initialCardInputs(nextRoundBets));
    setMarketInputs(initialMarketInputs());
    setLastResult(undefined);
    setHistory([]);
    submittedRound.current = undefined;
    setFormMessage('Game reset.');
  };

  const exportHistory = () => {
    const blob = new Blob([toCsv([...history].reverse())], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'round-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Trading interview practice</p>
          <h1>Risk Wager Dashboard</h1>
        </div>
      </header>

      <section className="summary-strip" aria-label="Bankroll summary">
        <div><span>Bankroll</span><strong>{formatUsd(bankroll)}</strong></div>
        <div><span>Cumulative P&L</span><strong className={cumulativePnl >= 0 ? 'positive' : 'negative'}>{formatSignedUsd(cumulativePnl)}</strong></div>
        <div><span>Current wagers</span><strong>{formatUsd(currentWagers)}</strong></div>
        <div><span>Round</span><strong>{roundNumber}</strong></div>
      </section>

      <div className="dashboard-grid">
        <OutcomePanels dice={lastResult?.dice} coins={lastResult?.coins} cards={lastResult?.cards} animating={animating} />
        <BettingTable title="Dice Wagers" definitions={roundBets.dice} values={diceInputs} errors={wagerErrors} onChange={(id, value) => updateInput(setDiceInputs, id, value)} />
        <BettingTable title="Coin Flip" definitions={roundBets.coin} values={coinInputs} errors={wagerErrors} onChange={(id, value) => updateInput(setCoinInputs, id, value)} />
        <BettingTable title="Card Draw" definitions={roundBets.cards} values={cardInputs} errors={wagerErrors} onChange={(id, value) => updateInput(setCardInputs, id, value)} />
        <MarketPanel position={marketInputs} parsedPosition={positions.market} errors={marketErrors} onChange={(field, value) => {
          setMarketInputs((current) => ({ ...current, [field]: value }));
          setFormMessage('');
        }} />
        <RiskPanel bankroll={bankroll} positions={positions} />
      </div>

      <section className="submit-bar" aria-live="polite">
        <button type="button" className="primary" onClick={handleSubmit} disabled={!canSubmit}>
          Submit Round
        </button>
        <p className={canSubmit ? 'form-message' : 'form-message negative'}>
          {formMessage || (riskTooLarge ? 'Maximum possible loss exceeds bankroll.' : !hasAnyPosition(positions) ? 'Enter at least one position to submit.' : hasValidationErrors ? 'Fix input errors to submit.' : 'Ready to submit.')}
        </p>
      </section>

      <ResultsTable result={lastResult} />
      <History history={history} onReset={resetGame} onExport={exportHistory} />
    </main>
  );
}

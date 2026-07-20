import type { RoundHistoryEntry } from '../domain/types';
import { describeCards, describeCardSum, describeProduct } from '../game/cards';
import { describeCoins } from '../game/coins';
import { describeDice } from '../game/dice';
import { formatSignedUsd, formatUsd } from '../utils/format';
import { ResultsTable } from './ResultsTable';

type HistoryProps = {
  history: RoundHistoryEntry[];
  onReset: () => void;
  onExport: () => void;
};

export function History({ history, onReset, onExport }: HistoryProps) {
  return (
    <section className="panel history-panel" aria-labelledby="history-heading">
      <div className="panel-header split">
        <h2 id="history-heading">Round History</h2>
        <div className="button-row">
          <button type="button" className="secondary" onClick={onExport} disabled={history.length === 0}>
            Export CSV
          </button>
          <button type="button" className="danger" onClick={onReset}>
            Reset Game
          </button>
        </div>
      </div>
      {history.length === 0 ? (
        <p className="empty-state">No completed rounds yet.</p>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <details key={entry.roundNumber}>
              <summary>
                <span>Round {entry.roundNumber}</span>
                <span>{describeDice(entry.dice)}</span>
                <span>{describeCoins(entry.coins)}</span>
                <span>{formatSignedUsd(entry.totalPnl)}</span>
              </summary>
              <dl className="summary-grid compact">
                <div><dt>Cards drawn</dt><dd>{describeCards(entry.cards)}</dd></div>
                <div><dt>Card product</dt><dd>{describeProduct(entry.cards)}</dd></div>
                <div><dt>Card sum</dt><dd>{describeCardSum(entry.cards)}</dd></div>
                <div><dt>Total wagered</dt><dd>{formatUsd(entry.totalBinaryWagers)}</dd></div>
                <div>
                  <dt>Market position</dt>
                  <dd>Sell {entry.marketSettlement.sellVolume}, buy {entry.marketSettlement.buyVolume}</dd>
                </div>
                <div><dt>Bankroll after</dt><dd>{formatUsd(entry.bankrollAfter)}</dd></div>
              </dl>
              <ResultsTable result={entry} />
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

import type { BinaryBetDefinition, BetSettlement, RoundPositions, RoundResult } from '../domain/types';
import { drawCardOutcome, describeCards, describeCardSum, describeProduct } from './cards';
import { describeCoins, flipCoins } from './coins';
import { describeDice, rollDice } from './dice';
import { settleMarket } from './market';
import type { RandomSource } from '../domain/types';
import { cardBetDefinitions } from './cards';
import { coinBetDefinitions } from './coins';
import { diceBetDefinitions } from './dice';

export const settleBinaryWager = <TOutcome>(
  definition: BinaryBetDefinition<TOutcome>,
  wager: number,
  outcome: TOutcome,
  result: string,
): BetSettlement => {
  const won = definition.wins(outcome);
  return {
    category: definition.category,
    position: definition.label,
    wager,
    result,
    status: won ? 'Won' : 'Lost',
    odds: definition.odds,
    pnl: won ? wager * definition.odds : -wager,
  };
};

const activeSettlements = <TOutcome>(
  definitions: BinaryBetDefinition<TOutcome>[],
  wagers: Record<string, number>,
  outcome: TOutcome,
  result: string,
): BetSettlement[] =>
  definitions
    .filter((definition) => (wagers[definition.id] ?? 0) > 0)
    .map((definition) => settleBinaryWager(definition, wagers[definition.id] ?? 0, outcome, result));

export const settleRound = (
  positions: RoundPositions,
  rng: RandomSource,
  roundNumber: number,
  bankrollBefore: number,
  definitions: {
    dice: BinaryBetDefinition<typeof diceBetDefinitions[number] extends BinaryBetDefinition<infer T> ? T : never>[];
    coin: BinaryBetDefinition<typeof coinBetDefinitions[number] extends BinaryBetDefinition<infer T> ? T : never>[];
    cards: BinaryBetDefinition<typeof cardBetDefinitions[number] extends BinaryBetDefinition<infer T> ? T : never>[];
  } = { dice: diceBetDefinitions, coin: coinBetDefinitions, cards: cardBetDefinitions },
): RoundResult => {
  const dice = rollDice(rng);
  const coins = flipCoins(rng);
  const cards = drawCardOutcome(rng);

  const binarySettlements = [
    ...activeSettlements(definitions.dice, positions.diceWagers, dice, describeDice(dice)),
    ...activeSettlements(definitions.coin, positions.coinWagers, coins, describeCoins(coins)),
    ...activeSettlements(definitions.cards, positions.cardWagers, cards, describeCards(cards)),
  ];

  const productResult = describeProduct(cards);
  const sumResult = describeCardSum(cards);
  const cardSettlements = binarySettlements.map((settlement) =>
    settlement.category === 'Cards'
      ? { ...settlement, result: `${settlement.result}; product ${productResult}; sum ${sumResult}` }
      : settlement,
  );

  const marketSettlement = settleMarket(positions.market, cards.sum);
  const binaryPnl = cardSettlements.reduce((total, settlement) => total + settlement.pnl, 0);
  const marketPnl = marketSettlement.pnl;
  const totalPnl = binaryPnl + marketPnl;
  const totalBinaryWagers = cardSettlements.reduce((total, settlement) => total + settlement.wager, 0);

  return {
    roundNumber,
    dice,
    coins,
    cards,
    binarySettlements: cardSettlements,
    marketSettlement,
    binaryPnl,
    marketPnl,
    totalPnl,
    bankrollAfter: bankrollBefore + totalPnl,
    totalBinaryWagers,
  };
};

import type { BinaryBetDefinition, CardOutcome, CoinOutcome, DiceOutcome, RandomSource } from '../domain/types';
import { cardPropositions, coinPropositions, dicePropositions, type Proposition } from './propositions';
import { enumerateCardOutcomes } from './cards';
import { enumerateCoinOutcomes } from './coins';
import { enumerateDiceOutcomes } from './dice';
import { exactProbability, expectedProfitPerDollar } from '../probability/probability';

export const WAGER_ROW_COUNTS = { dice: 7, coin: 5, cards: 3 } as const;

export type RoundBetDefinitions = {
  dice: BinaryBetDefinition<DiceOutcome>[];
  coin: BinaryBetDefinition<CoinOutcome>[];
  cards: BinaryBetDefinition<CardOutcome>[];
};

const roundedOdds = (probability: number, positive: boolean, rng: RandomSource): number => {
  const targetEdge = positive
    ? 0.02 + rng.int(81) / 1000
    : -(0.03 + rng.int(121) / 1000);
  let odds = Math.max(0, Math.round((((1 + targetEdge) / probability) - 1) * 10) / 10);
  const adjustment = positive ? 0.1 : -0.1;
  while ((positive ? expectedProfitPerDollar(probability, odds) <= 0 : expectedProfitPerDollar(probability, odds) >= 0) && odds >= 0) {
    odds = Math.round((odds + adjustment) * 10) / 10;
  }
  if (odds < 0) {
    throw new Error('Could not create a negative expected-value price for this proposition.');
  }
  return odds;
};

const candidatesFor = <TOutcome>(
  propositions: Proposition<TOutcome>[],
  outcomes: TOutcome[],
): { proposition: Proposition<TOutcome>; probability: number }[] => {
  return propositions
    .map((proposition) => ({ proposition, probability: exactProbability(outcomes, proposition.wins) }))
    // Prices are shown to one decimal place, so avoid propositions whose probability cannot be
    // offered with both sides of zero EV at that precision.
    .filter(({ probability }) => probability >= 0.05 && probability <= 0.95);
};

const select = <TOutcome>(
  candidates: { proposition: Proposition<TOutcome>; probability: number }[],
  count: number,
  rng: RandomSource,
): { proposition: Proposition<TOutcome>; probability: number }[] => {
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.int(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
};

const diceCandidates = candidatesFor(dicePropositions, enumerateDiceOutcomes());
const coinCandidates = candidatesFor(coinPropositions, enumerateCoinOutcomes());
const cardCandidates = candidatesFor(cardPropositions, enumerateCardOutcomes());

const offer = <TOutcome>(
  entries: { proposition: Proposition<TOutcome>; probability: number }[],
  category: BinaryBetDefinition<TOutcome>['category'],
  positiveSlots: Set<number>,
  offset: number,
  rng: RandomSource,
): BinaryBetDefinition<TOutcome>[] => entries.map(({ proposition, probability }, index) => ({
  ...proposition,
  category,
  odds: roundedOdds(probability, positiveSlots.has(offset + index), rng),
}));

export const createRoundBetDefinitions = (rng: RandomSource): RoundBetDefinitions => {
  const dice = select(diceCandidates, WAGER_ROW_COUNTS.dice, rng);
  const coin = select(coinCandidates, WAGER_ROW_COUNTS.coin, rng);
  const cards = select(cardCandidates, WAGER_ROW_COUNTS.cards, rng);
  const positiveIndexes = new Set<number>();
  const total = WAGER_ROW_COUNTS.dice + WAGER_ROW_COUNTS.coin + WAGER_ROW_COUNTS.cards;
  while (positiveIndexes.size < 3) positiveIndexes.add(rng.int(total));
  return {
    dice: offer(dice, 'Dice', positiveIndexes, 0, rng),
    coin: offer(coin, 'Coin', positiveIndexes, WAGER_ROW_COUNTS.dice, rng),
    cards: offer(cards, 'Cards', positiveIndexes, WAGER_ROW_COUNTS.dice + WAGER_ROW_COUNTS.coin, rng),
  };
};

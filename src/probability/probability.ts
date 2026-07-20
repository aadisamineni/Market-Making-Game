import type { PracticeMetric } from '../domain/types';
import { enumerateOrderedCardPairs } from '../game/cards';
import { enumerateCoinOutcomes } from '../game/coins';
import { enumerateDiceOutcomes } from '../game/dice';
import { cardBetDefinitions } from '../game/cards';
import { coinBetDefinitions } from '../game/coins';
import { diceBetDefinitions } from '../game/dice';

export const decimalPayout = (profitOdds: number): number => profitOdds + 1;

export const breakEvenProbability = (profitOdds: number): number => 1 / decimalPayout(profitOdds);

export const expectedProfitPerDollar = (trueProbability: number, profitOdds: number): number =>
  trueProbability * profitOdds - (1 - trueProbability);

export const kellyFraction = (trueProbability: number, profitOdds: number): number =>
  Math.max(0, expectedProfitPerDollar(trueProbability, profitOdds) / profitOdds);

export const exactProbability = <TOutcome>(
  outcomes: TOutcome[],
  predicate: (outcome: TOutcome) => boolean,
): number => outcomes.filter(predicate).length / outcomes.length;

export const diceProbabilities = (): Record<string, number> =>
  Object.fromEntries(
    diceBetDefinitions.map((definition) => [
      definition.id,
      exactProbability(enumerateDiceOutcomes(), definition.wins),
    ]),
  );

export const coinProbabilities = (): Record<string, number> =>
  Object.fromEntries(
    coinBetDefinitions.map((definition) => [
      definition.id,
      exactProbability(enumerateCoinOutcomes(), definition.wins),
    ]),
  );

export const cardProbabilities = (): Record<string, number> => {
  const orderedPairs = enumerateOrderedCardPairs();
  return Object.fromEntries(
    cardBetDefinitions.map((definition) => [
      definition.id,
      orderedPairs.filter(([first, second]) =>
        definition.wins({ cards: [first, second, first], product: first.value * second.value, sum: 0 }),
      ).length / orderedPairs.length,
    ]),
  );
};

export const createPracticeMetrics = (
  definitions: { id: string; odds: number }[],
  probabilities: Record<string, number>,
): Record<string, PracticeMetric> => {
  const metrics: Record<string, PracticeMetric> = {};
  for (const definition of definitions) {
    const trueProbability = probabilities[definition.id];
    const ev = expectedProfitPerDollar(trueProbability, definition.odds);
    metrics[definition.id] = {
      betId: definition.id,
      trueProbability,
      decimalPayout: decimalPayout(definition.odds),
      breakEvenProbability: breakEvenProbability(definition.odds),
      expectedProfitPerDollar: ev,
      expectedReturnPercentage: ev * 100,
      evLabel: Math.abs(ev) < 1e-10 ? 'Fair' : ev > 0 ? 'Positive EV' : 'Negative EV',
      kellyFraction: kellyFraction(trueProbability, definition.odds),
    };
  }
  return metrics;
};

export const allPracticeMetrics = (): Record<string, PracticeMetric> => ({
  ...createPracticeMetrics(diceBetDefinitions, diceProbabilities()),
  ...createPracticeMetrics(coinBetDefinitions, coinProbabilities()),
  ...createPracticeMetrics(cardBetDefinitions, cardProbabilities()),
});

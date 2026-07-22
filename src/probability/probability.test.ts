import { describe, expect, it } from 'vitest';
import { cardPredicates } from '../game/cards';
import { coinPredicates } from '../game/coins';
import { dicePredicates } from '../game/dice';
import {
  breakEvenProbability,
  cardProbabilities,
  coinProbabilities,
  decimalPayout,
  diceProbabilities,
  expectedProfitPerDollar,
} from './probability';

describe('exact probability math', () => {
  it('uses net-profit odds for break-even probability and expected profit', () => {
    expect(decimalPayout(2.7)).toBeCloseTo(3.7);
    expect(breakEvenProbability(2.7)).toBeCloseTo(1 / 3.7);
    expect(expectedProfitPerDollar(0.5, 0.9)).toBeCloseTo(-0.05);
  });

  it('computes dice probabilities from all 36 ordered outcomes', () => {
    const probabilities = diceProbabilities();
    expect(probabilities['dice-sum-6-7-8']).toBeCloseTo(16 / 36);
    expect(probabilities['dice-sum-even']).toBeCloseTo(18 / 36);
    expect(probabilities['dice-sum-10-11-12']).toBeCloseTo(6 / 36);
    expect(dicePredicates['dice-product-perfect-square']({ die1: 2, die2: 2, sum: 4 })).toBe(true);
  });

  it('computes coin probabilities from all eight ordered outcomes', () => {
    const probabilities = coinProbabilities();
    expect(probabilities['coin-all-identical']).toBeCloseTo(2 / 8);
    expect(probabilities['coin-more-heads']).toBeCloseTo(4 / 8);
    expect(probabilities['coin-alternating']).toBeCloseTo(2 / 8);
    expect(probabilities['coin-contains-hh']).toBeCloseTo(3 / 8);
    expect(coinPredicates['coin-middle-differs-outside'](['H', 'T', 'H'])).toBe(true);
  });

  it('computes card probabilities from all 52P3 ordered physical draws', () => {
    const probabilities = cardProbabilities();
    expect(probabilities['card-product-even']).toBeCloseTo(1896 / 2652);
    expect(probabilities['card-product-above-50']).toBeCloseTo(1032 / 2652);
    expect(probabilities['card-product-above-100']).toBeCloseTo(324 / 2652);
    expect(probabilities['card-all-match']).toBeCloseTo(312 / (52 * 51 * 50));
    expect(cardPredicates['card-third-equals-first-two-sum']({
      cards: [{ rank: '2', suit: 'spades', value: 2 }, { rank: '3', suit: 'hearts', value: 3 }, { rank: '5', suit: 'clubs', value: 5 }],
      product: 6, sum: 10,
    })).toBe(true);
  });
});

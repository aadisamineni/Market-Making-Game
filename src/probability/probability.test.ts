import { describe, expect, it } from 'vitest';
import {
  breakEvenProbability,
  cardProbabilities,
  coinProbabilities,
  decimalPayout,
  diceProbabilities,
  expectedProfitPerDollar,
  kellyFraction,
} from './probability';

describe('probability math', () => {
  it('computes break-even probability from profit odds', () => {
    expect(decimalPayout(2.7)).toBeCloseTo(3.7);
    expect(breakEvenProbability(2.7)).toBeCloseTo(1 / 3.7);
  });

  it('computes expected value per dollar', () => {
    expect(expectedProfitPerDollar(0.5, 0.9)).toBeCloseTo(-0.05);
    expect(kellyFraction(0.5, 0.9)).toBe(0);
  });

  it('computes exact dice probabilities from 36 ordered outcomes', () => {
    const probabilities = diceProbabilities();
    expect(probabilities['dice-6-7-8']).toBeCloseTo(16 / 36);
    expect(probabilities['dice-even']).toBeCloseTo(18 / 36);
    expect(probabilities['dice-11-12']).toBeCloseTo(3 / 36);
  });

  it('computes exact coin probabilities from 8 ordered outcomes', () => {
    const probabilities = coinProbabilities();
    expect(probabilities['coin-all-identical']).toBeCloseTo(2 / 8);
    expect(probabilities['coin-more-heads']).toBeCloseTo(4 / 8);
    expect(probabilities['coin-alternating']).toBeCloseTo(2 / 8);
    expect(probabilities['coin-contains-hh']).toBeCloseTo(3 / 8);
  });

  it('computes exact card probabilities from ordered physical card pairs', () => {
    const probabilities = cardProbabilities();
    expect(probabilities['card-even-product']).toBeCloseTo(1896 / 2652);
    expect(probabilities['card-product-above-50']).toBeCloseTo(1032 / 2652);
    expect(probabilities['card-product-above-100']).toBeCloseTo(324 / 2652);
  });
});

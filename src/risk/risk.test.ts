import { describe, expect, it } from 'vitest';
import type { RoundPositions } from '../domain/types';
import { maximumRoundLoss, remainingBankrollAfterWorstCase, totalBinaryWagers, worstCaseMarketLoss } from './risk';

describe('risk calculations', () => {
  it('computes worst-case market loss', () => {
    expect(worstCaseMarketLoss({ sellVolume: 4, buyVolume: 0 })).toBe(72);
    expect(worstCaseMarketLoss({ sellVolume: 0, buyVolume: 5 })).toBe(100);
    expect(worstCaseMarketLoss({ sellVolume: 4, buyVolume: 5 })).toBe(28);
  });

  it('computes maximum round loss', () => {
    const positions: RoundPositions = {
      diceWagers: { a: 10 },
      coinWagers: { b: 2.5 },
      cardWagers: { c: 7.5 },
      market: { sellVolume: 0, buyVolume: 5 },
    };
    expect(totalBinaryWagers(positions)).toBe(20);
    expect(maximumRoundLoss(positions)).toBe(120);
    expect(remainingBankrollAfterWorstCase(200, positions)).toBe(80);
  });
});

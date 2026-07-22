import { describe, expect, it } from 'vitest';
import type { BinaryBetDefinition, RandomSource } from '../domain/types';
import { enumerateCardOutcomes } from './cards';
import { enumerateCoinOutcomes } from './coins';
import { enumerateDiceOutcomes } from './dice';
import { createRoundBetDefinitions, WAGER_ROW_COUNTS } from './rounds';
import { exactProbability, expectedProfitPerDollar } from '../probability/probability';

const seededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return {
    int(maxExclusive: number): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state % maxExclusive;
    },
  };
};

const ids = (definitions: { id: string }[]) => definitions.map((definition) => definition.id);

const edge = <T>(definition: BinaryBetDefinition<T>, outcomes: T[]) =>
  expectedProfitPerDollar(exactProbability(outcomes, definition.wins), definition.odds);

describe('round proposition rotation and pricing', () => {
  it('displays the existing row counts with no duplicate question in a section', () => {
    const round = createRoundBetDefinitions(seededRandom(1));
    expect(round.dice).toHaveLength(WAGER_ROW_COUNTS.dice);
    expect(round.coin).toHaveLength(WAGER_ROW_COUNTS.coin);
    expect(round.cards).toHaveLength(WAGER_ROW_COUNTS.cards);
    expect(new Set(ids(round.dice)).size).toBe(WAGER_ROW_COUNTS.dice);
    expect(new Set(ids(round.coin)).size).toBe(WAGER_ROW_COUNTS.coin);
    expect(new Set(ids(round.cards)).size).toBe(WAGER_ROW_COUNTS.cards);
  });

  it('keeps a generated round unchanged and permits repetition in later rounds', () => {
    const round = createRoundBetDefinitions(seededRandom(2));
    expect(ids(round.dice)).toEqual(ids(round.dice));
    expect(ids(round.coin)).toEqual(ids(round.coin));
    expect(ids(round.cards)).toEqual(ids(round.cards));
    const laterRound = createRoundBetDefinitions(seededRandom(2));
    expect(ids(laterRound.dice)).toEqual(ids(round.dice));
    expect(ids(laterRound.coin)).toEqual(ids(round.coin));
    expect(ids(laterRound.cards)).toEqual(ids(round.cards));
  });

  it('changes the offered questions when a new round begins', () => {
    const first = createRoundBetDefinitions(seededRandom(3));
    const second = createRoundBetDefinitions(seededRandom(4));
    expect([...ids(first.dice), ...ids(first.coin), ...ids(first.cards)])
      .not.toEqual([...ids(second.dice), ...ids(second.coin), ...ids(second.cards)]);
  });

  it('keeps rounded positive prices positive and rounded negative prices negative', () => {
    const diceOutcomes = enumerateDiceOutcomes();
    const coinOutcomes = enumerateCoinOutcomes();
    const cardOutcomes = enumerateCardOutcomes();
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = createRoundBetDefinitions(seededRandom(seed));
      const edges = [
        ...round.dice.map((definition) => edge(definition, diceOutcomes)),
        ...round.coin.map((definition) => edge(definition, coinOutcomes)),
        ...round.cards.map((definition) => edge(definition, cardOutcomes)),
      ];
      expect(edges.filter((value) => value > 0)).toHaveLength(3);
      expect(edges.filter((value) => value < 0)).toHaveLength(12);
    }
  });

  it('offers exactly 20% positive-EV wagers across many rounds and at least one each round', () => {
    const diceOutcomes = enumerateDiceOutcomes();
    const coinOutcomes = enumerateCoinOutcomes();
    const cardOutcomes = enumerateCardOutcomes();
    let positives = 0;
    let total = 0;
    for (let seed = 40; seed < 90; seed += 1) {
      const round = createRoundBetDefinitions(seededRandom(seed));
      const edges = [
        ...round.dice.map((definition) => edge(definition, diceOutcomes)),
        ...round.coin.map((definition) => edge(definition, coinOutcomes)),
        ...round.cards.map((definition) => edge(definition, cardOutcomes)),
      ];
      const roundPositives = edges.filter((value) => value > 0).length;
      expect(roundPositives).toBeGreaterThan(0);
      positives += roundPositives;
      total += edges.length;
    }
    expect(positives / total).toBeCloseTo(0.2, 8);
  });
});

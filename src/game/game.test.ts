import { describe, expect, it } from 'vitest';
import type { BinaryBetDefinition, CardOutcome, DiceOutcome, RoundPositions } from '../domain/types';
import { buildDeck, cardValue, createCardOutcome, drawCards, enumerateCardOutcomes } from './cards';
import { enumerateCoinOutcomes } from './coins';
import { enumerateDiceOutcomes } from './dice';
import { cardPropositions, coinPropositions, dicePropositions } from './propositions';
import { createSequenceRandomSource } from './random';
import { settleMarket } from './market';
import { settleBinaryWager, settleRound } from './settlement';

describe('proposition catalogues', () => {
  it('gives every dice proposition a winning and losing ordered d6 outcome', () => {
    const outcomes = enumerateDiceOutcomes();
    for (const proposition of dicePropositions) {
      const wins = outcomes.filter(proposition.wins).length;
      expect(wins, proposition.label).toBeGreaterThan(0);
      expect(wins, proposition.label).toBeLessThan(outcomes.length);
    }
  });

  it('gives every coin proposition a winning and losing three-flip outcome', () => {
    const outcomes = enumerateCoinOutcomes();
    for (const proposition of coinPropositions) {
      const wins = outcomes.filter(proposition.wins).length;
      expect(wins, proposition.label).toBeGreaterThan(0);
      expect(wins, proposition.label).toBeLessThan(outcomes.length);
    }
  });

  it('gives every card proposition a winning and losing physical three-card outcome', () => {
    const outcomes = enumerateCardOutcomes();
    for (const proposition of cardPropositions) {
      const wins = outcomes.filter(proposition.wins).length;
      expect(wins, proposition.label).toBeGreaterThan(0);
      expect(wins, proposition.label).toBeLessThan(outcomes.length);
    }
  });
});

describe('card model and market', () => {
  it('uses a 52-card deck, numerical ace/face values, and draws without replacement', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    expect(cardValue('A')).toBe(1);
    expect(cardValue('J')).toBe(11);
    expect(cardValue('Q')).toBe(12);
    expect(cardValue('K')).toBe(13);
    const drawn = drawCards(createSequenceRandomSource(Array.from({ length: 52 }, () => 0)), 3);
    expect(new Set(drawn.map((card) => `${card.rank}-${card.suit}`)).size).toBe(3);
  });

  it('keeps market P&L based only on the realized three-card sum', () => {
    expect(settleMarket({ buyVolume: 5, sellVolume: 0 }, 27).pnl).toBe(20);
    expect(settleMarket({ buyVolume: 0, sellVolume: 4 }, 25).pnl).toBe(-16);
    const sameSumDifferentProducts: [CardOutcome, CardOutcome] = [
      createCardOutcome([{ rank: '2', suit: 'spades', value: 2 }, { rank: '8', suit: 'hearts', value: 8 }, { rank: '10', suit: 'clubs', value: 10 }]),
      createCardOutcome([{ rank: '4', suit: 'spades', value: 4 }, { rank: '4', suit: 'hearts', value: 4 }, { rank: 'Q', suit: 'clubs', value: 12 }]),
    ];
    expect(sameSumDifferentProducts[0].sum).toBe(sameSumDifferentProducts[1].sum);
    expect(settleMarket({ buyVolume: 2, sellVolume: 1 }, sameSumDifferentProducts[0].sum).pnl)
      .toBe(settleMarket({ buyVolume: 2, sellVolume: 1 }, sameSumDifferentProducts[1].sum).pnl);
  });
});

describe('binary and round settlement', () => {
  const winningDefinition: BinaryBetDefinition<DiceOutcome> = {
    id: 'winning', category: 'Dice', label: 'Winning test', odds: 2.7, wins: () => true,
  };
  const losingDefinition: BinaryBetDefinition<DiceOutcome> = {
    id: 'losing', category: 'Dice', label: 'Losing test', odds: 2.7, wins: () => false,
  };

  it('uses net-profit odds and handles winning, losing, and zero-dollar wagers', () => {
    const outcome = { die1: 1, die2: 1, sum: 2 };
    expect(settleBinaryWager(winningDefinition, 10, outcome, '2').pnl).toBe(27);
    expect(settleBinaryWager(losingDefinition, 10, outcome, '2').pnl).toBe(-10);
    expect(settleBinaryWager(winningDefinition, 0, outcome, '2').pnl).toBe(0);
  });

  it('updates a round bankroll exactly once from binary and market P&L', () => {
    const positions: RoundPositions = {
      diceWagers: { winning: 10 }, coinWagers: {}, cardWagers: {}, market: { sellVolume: 0, buyVolume: 0 },
    };
    const result = settleRound(
      positions,
      createSequenceRandomSource([0, 0, 0, 0, 0, ...Array.from({ length: 51 }, () => 0)]),
      1,
      100,
      { dice: [winningDefinition], coin: [], cards: [] },
    );
    expect(result.totalPnl).toBe(27);
    expect(result.bankrollAfter).toBe(127);
  });
});

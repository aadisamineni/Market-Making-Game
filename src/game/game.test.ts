import { describe, expect, it } from 'vitest';
import { CARD_BETS } from '../config/gameConfig';
import type { CardOutcome, PlayingCard, RoundPositions } from '../domain/types';
import { buildDeck, cardPredicates, cardValue, createCardOutcome, drawCards } from './cards';
import { coinPredicates } from './coins';
import { dicePredicates } from './dice';
import { settleMarket } from './market';
import { createSequenceRandomSource } from './random';
import { settleBinaryWager, settleRound } from './settlement';
import { cardBetDefinitions } from './cards';

const card = (rank: PlayingCard['rank'], suit: PlayingCard['suit']): PlayingCard => ({
  rank,
  suit,
  value: cardValue(rank),
});

describe('odds settlement', () => {
  it('settles winning profit odds without returning stake', () => {
    const definition = { id: 'x', category: 'Dice' as const, label: 'Win', odds: 2.7, wins: () => true };
    expect(settleBinaryWager(definition, 10, {}, 'result').pnl).toBe(27);
  });

  it('settles losing wager as negative stake', () => {
    const definition = { id: 'x', category: 'Dice' as const, label: 'Lose', odds: 2.7, wins: () => false };
    expect(settleBinaryWager(definition, 10, {}, 'result').pnl).toBe(-10);
  });
});

describe('dice predicates', () => {
  it('sum 8 qualifies for 6, 7, or 8 and Even', () => {
    const outcome = { die1: 3, die2: 5, sum: 8 };
    expect(dicePredicates['dice-6-7-8'](outcome)).toBe(true);
    expect(dicePredicates['dice-even'](outcome)).toBe(true);
    expect(dicePredicates['dice-odd'](outcome)).toBe(false);
  });

  it('sum 11 qualifies for 11 or 12 and Odd', () => {
    const outcome = { die1: 5, die2: 6, sum: 11 };
    expect(dicePredicates['dice-11-12'](outcome)).toBe(true);
    expect(dicePredicates['dice-odd'](outcome)).toBe(true);
  });
});

describe('coin predicates', () => {
  it('HHH qualifies for all-identical, more-heads, and contains-HH', () => {
    expect(coinPredicates['coin-all-identical'](['H', 'H', 'H'])).toBe(true);
    expect(coinPredicates['coin-more-heads'](['H', 'H', 'H'])).toBe(true);
    expect(coinPredicates['coin-contains-hh'](['H', 'H', 'H'])).toBe(true);
  });

  it('HTH qualifies for more-heads and alternating, but not contains-HH', () => {
    expect(coinPredicates['coin-more-heads'](['H', 'T', 'H'])).toBe(true);
    expect(coinPredicates['coin-alternating'](['H', 'T', 'H'])).toBe(true);
    expect(coinPredicates['coin-contains-hh'](['H', 'T', 'H'])).toBe(false);
  });

  it('THT qualifies for more-tails and alternating', () => {
    expect(coinPredicates['coin-more-tails'](['T', 'H', 'T'])).toBe(true);
    expect(coinPredicates['coin-alternating'](['T', 'H', 'T'])).toBe(true);
  });
});

describe('deck and card predicates', () => {
  it('builds a standard 52-card deck', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((item) => `${item.rank}-${item.suit}`))).toHaveLength(52);
  });

  it('draws cards without replacement', () => {
    const drawn = drawCards(createSequenceRandomSource(Array.from({ length: 52 }, () => 0)), 3);
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn.map((item) => `${item.rank}-${item.suit}`))).toHaveLength(3);
  });

  it('evaluates product 84 above 50 but not above 100', () => {
    const outcome: CardOutcome = createCardOutcome([card('Q', 'spades'), card('7', 'diamonds'), card('2', 'clubs')]);
    expect(outcome.product).toBe(84);
    expect(cardPredicates['card-product-above-50'](outcome)).toBe(true);
    expect(cardPredicates['card-product-above-100'](outcome)).toBe(false);
  });

  it('evaluates product 120 above 50 and above 100', () => {
    const outcome = createCardOutcome([card('Q', 'spades'), card('10', 'diamonds'), card('2', 'clubs')]);
    expect(outcome.product).toBe(120);
    expect(cardPredicates['card-product-above-50'](outcome)).toBe(true);
    expect(cardPredicates['card-product-above-100'](outcome)).toBe(true);
  });

  it('keeps all configured card bet predicates available', () => {
    expect(CARD_BETS.every((bet) => cardBetDefinitions.some((definition) => definition.id === bet.id))).toBe(true);
  });
});

describe('card market', () => {
  it('buy 5 at 23 settling at 27 produces +20', () => {
    expect(settleMarket({ buyVolume: 5, sellVolume: 0 }, 27).pnl).toBe(20);
  });

  it('sell 4 at 21 settling at 25 produces -16', () => {
    expect(settleMarket({ buyVolume: 0, sellVolume: 4 }, 25).pnl).toBe(-16);
  });
});

describe('complete round settlement', () => {
  it('settles a deterministic complete round', () => {
    const positions: RoundPositions = {
      diceWagers: { 'dice-6-7-8': 10, 'dice-even': 5 },
      coinWagers: { 'coin-more-heads': 3, 'coin-alternating': 2, 'coin-contains-hh': 4 },
      cardWagers: { 'card-product-above-50': 7, 'card-product-above-100': 8 },
      market: { sellVolume: 1, buyVolume: 2 },
    };
    const rng = createSequenceRandomSource([
      2, 4,
      0, 1, 0,
      ...Array.from({ length: 51 }, (_value, index) => 51 - index),
    ]);
    const result = settleRound(positions, rng, 1, 2298);
    expect(result.dice.sum).toBe(8);
    expect(result.coins.join('')).toBe('HTH');
    expect(result.cards.cards.map((item) => `${item.rank}-${item.suit}`)).toEqual(['A-spades', '2-spades', '3-spades']);
    expect(result.cards.product).toBe(2);
    expect(result.cards.sum).toBe(6);
    expect(result.marketPnl).toBe(-19);
    expect(result.totalPnl).toBeCloseTo(-8.9);
    expect(result.bankrollAfter).toBeCloseTo(2289.1);
  });
});

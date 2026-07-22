import type { BinaryBetDefinition, CardOutcome, PlayingCard, RandomSource, Rank, Suit } from '../domain/types';
import { cardPropositions } from './propositions';

const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const cardValue = (rank: Rank): number => {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return Number(rank);
};

export const buildDeck = (): PlayingCard[] =>
  suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit, value: cardValue(rank) })));

export const shuffleDeck = (deck: PlayingCard[], rng: RandomSource): PlayingCard[] => {
  const shuffled = [...deck];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.int(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const drawCards = (rng: RandomSource, count = 3): PlayingCard[] => shuffleDeck(buildDeck(), rng).slice(0, count);

export const createCardOutcome = (cards: PlayingCard[]): CardOutcome => {
  if (cards.length !== 3) {
    throw new Error('Card outcome requires exactly three cards.');
  }
  const typedCards = cards as [PlayingCard, PlayingCard, PlayingCard];
  return {
    cards: typedCards,
    product: typedCards[0].value * typedCards[1].value,
    sum: typedCards[0].value + typedCards[1].value + typedCards[2].value,
  };
};

export const drawCardOutcome = (rng: RandomSource): CardOutcome => createCardOutcome(drawCards(rng, 3));

export const cardPredicates: Record<string, (outcome: CardOutcome) => boolean> = Object.fromEntries(
  cardPropositions.map((proposition) => [proposition.id, proposition.wins]),
);

export const cardBetDefinitions: BinaryBetDefinition<CardOutcome>[] = cardPropositions.map((bet) => ({
  ...bet,
  category: 'Cards',
  odds: 0,
}));

export const suitSymbol = (suit: Suit): string => {
  const symbols: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  return symbols[suit];
};

export const formatCard = (card: PlayingCard): string => `${card.rank}${suitSymbol(card.suit)}`;

export const describeCards = ({ cards }: CardOutcome): string => cards.map(formatCard).join(', ');

export const describeProduct = ({ cards, product }: CardOutcome): string =>
  `${cards[0].value} × ${cards[1].value} = ${product}`;

export const describeCardSum = ({ cards, sum }: CardOutcome): string =>
  `${cards[0].value} + ${cards[1].value} + ${cards[2].value} = ${sum}`;

export const enumerateOrderedCardPairs = (): [PlayingCard, PlayingCard][] => {
  const deck = buildDeck();
  const pairs: [PlayingCard, PlayingCard][] = [];
  for (let first = 0; first < deck.length; first += 1) {
    for (let second = 0; second < deck.length; second += 1) {
      if (first !== second) pairs.push([deck[first], deck[second]]);
    }
  }
  return pairs;
};

export const enumerateCardOutcomes = (): CardOutcome[] => {
  const deck = buildDeck();
  const outcomes: CardOutcome[] = [];
  for (let first = 0; first < deck.length; first += 1) {
    for (let second = 0; second < deck.length; second += 1) {
      if (second === first) continue;
      for (let third = 0; third < deck.length; third += 1) {
        if (third !== first && third !== second) outcomes.push(createCardOutcome([deck[first], deck[second], deck[third]]));
      }
    }
  }
  return outcomes;
};

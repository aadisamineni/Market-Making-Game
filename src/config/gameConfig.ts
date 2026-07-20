import type { ProfitOdds } from '../domain/types';

export const STARTING_BANKROLL = 2298;

export const MARKET_CONFIG = {
  bid: 21,
  ask: 23,
  minCardSum: 3,
  maxCardSum: 39,
} as const;

export type BinaryBetConfig = {
  id: string;
  label: string;
  odds: ProfitOdds;
};

export const DICE_BETS: BinaryBetConfig[] = [
  { id: 'dice-2-or-3', label: '2 or 3', odds: 8.8 },
  { id: 'dice-4', label: '4', odds: 8.8 },
  { id: 'dice-10', label: '10', odds: 11.0 },
  { id: 'dice-6-7-8', label: '6, 7, or 8', odds: 1.5 },
  { id: 'dice-11-12', label: '11 or 12', odds: 12.1 },
  { id: 'dice-even', label: 'Even', odds: 0.9 },
  { id: 'dice-odd', label: 'Odd', odds: 0.8 },
];

export const COIN_BETS: BinaryBetConfig[] = [
  { id: 'coin-all-identical', label: 'All three identical', odds: 2.7 },
  { id: 'coin-more-heads', label: 'More heads than tails', odds: 0.8 },
  { id: 'coin-more-tails', label: 'More tails than heads', odds: 0.8 },
  { id: 'coin-alternating', label: 'All three flips alternating (HTH or THT)', odds: 3.6 },
  { id: 'coin-contains-hh', label: 'Contains an HH sequence', odds: 2.5 },
];

export const CARD_BETS: BinaryBetConfig[] = [
  { id: 'card-even-product', label: 'Even product', odds: 0.5 },
  { id: 'card-product-above-50', label: 'Product above 50', odds: 1.6 },
  { id: 'card-product-above-100', label: 'Product above 100', odds: 7.9 },
];

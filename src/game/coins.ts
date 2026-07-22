import type { BinaryBetDefinition, CoinFace, CoinOutcome, RandomSource } from '../domain/types';
import { coinPropositions } from './propositions';

export const flipCoins = (rng: RandomSource): CoinOutcome => [
  rng.int(2) === 0 ? 'H' : 'T',
  rng.int(2) === 0 ? 'H' : 'T',
  rng.int(2) === 0 ? 'H' : 'T',
];

export const coinPredicates: Record<string, (outcome: CoinOutcome) => boolean> = Object.fromEntries(
  coinPropositions.map((proposition) => [proposition.id, proposition.wins]),
);

export const coinBetDefinitions: BinaryBetDefinition<CoinOutcome>[] = coinPropositions.map((bet) => ({
  ...bet,
  category: 'Coin',
  odds: 0,
}));

export const enumerateCoinOutcomes = (): CoinOutcome[] => {
  const faces: CoinFace[] = ['H', 'T'];
  const outcomes: CoinOutcome[] = [];
  for (const first of faces) {
    for (const second of faces) {
      for (const third of faces) {
        outcomes.push([first, second, third]);
      }
    }
  }
  return outcomes;
};

export const describeCoins = (outcome: CoinOutcome): string => outcome.join('');

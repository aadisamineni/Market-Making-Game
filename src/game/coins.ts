import { COIN_BETS } from '../config/gameConfig';
import type { BinaryBetDefinition, CoinFace, CoinOutcome, RandomSource } from '../domain/types';

export const flipCoins = (rng: RandomSource): CoinOutcome => [
  rng.int(2) === 0 ? 'H' : 'T',
  rng.int(2) === 0 ? 'H' : 'T',
  rng.int(2) === 0 ? 'H' : 'T',
];

const countHeads = (outcome: CoinOutcome): number => outcome.filter((face) => face === 'H').length;

export const coinPredicates: Record<string, (outcome: CoinOutcome) => boolean> = {
  'coin-all-identical': ([a, b, c]) => a === b && b === c,
  'coin-more-heads': (outcome) => countHeads(outcome) >= 2,
  'coin-more-tails': (outcome) => countHeads(outcome) <= 1,
  'coin-alternating': (outcome) => outcome.join('') === 'HTH' || outcome.join('') === 'THT',
  'coin-contains-hh': (outcome) => outcome.join('').includes('HH'),
};

export const coinBetDefinitions: BinaryBetDefinition<CoinOutcome>[] = COIN_BETS.map((bet) => ({
  ...bet,
  category: 'Coin',
  wins: coinPredicates[bet.id],
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

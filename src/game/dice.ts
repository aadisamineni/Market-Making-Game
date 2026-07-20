import { DICE_BETS } from '../config/gameConfig';
import type { BinaryBetDefinition, DiceOutcome, RandomSource } from '../domain/types';

export const rollDice = (rng: RandomSource): DiceOutcome => {
  const die1 = rng.int(6) + 1;
  const die2 = rng.int(6) + 1;
  return { die1, die2, sum: die1 + die2 };
};

export const dicePredicates: Record<string, (outcome: DiceOutcome) => boolean> = {
  'dice-2-or-3': ({ sum }) => sum === 2 || sum === 3,
  'dice-4': ({ sum }) => sum === 4,
  'dice-10': ({ sum }) => sum === 10,
  'dice-6-7-8': ({ sum }) => sum === 6 || sum === 7 || sum === 8,
  'dice-11-12': ({ sum }) => sum === 11 || sum === 12,
  'dice-even': ({ sum }) => sum % 2 === 0,
  'dice-odd': ({ sum }) => sum % 2 === 1,
};

export const diceBetDefinitions: BinaryBetDefinition<DiceOutcome>[] = DICE_BETS.map((bet) => ({
  ...bet,
  category: 'Dice',
  wins: dicePredicates[bet.id],
}));

export const enumerateDiceOutcomes = (): DiceOutcome[] => {
  const outcomes: DiceOutcome[] = [];
  for (let die1 = 1; die1 <= 6; die1 += 1) {
    for (let die2 = 1; die2 <= 6; die2 += 1) {
      outcomes.push({ die1, die2, sum: die1 + die2 });
    }
  }
  return outcomes;
};

export const describeDice = ({ die1, die2, sum }: DiceOutcome): string => `Rolled ${die1} + ${die2} = ${sum}`;

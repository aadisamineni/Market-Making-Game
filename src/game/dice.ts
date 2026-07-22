import type { BinaryBetDefinition, DiceOutcome, RandomSource } from '../domain/types';
import { dicePropositions } from './propositions';

export const rollDice = (rng: RandomSource): DiceOutcome => {
  const die1 = rng.int(6) + 1;
  const die2 = rng.int(6) + 1;
  return { die1, die2, sum: die1 + die2 };
};

export const dicePredicates: Record<string, (outcome: DiceOutcome) => boolean> = Object.fromEntries(
  dicePropositions.map((proposition) => [proposition.id, proposition.wins]),
);

export const diceBetDefinitions: BinaryBetDefinition<DiceOutcome>[] = dicePropositions.map((bet) => ({
  ...bet,
  category: 'Dice',
  odds: 0,
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

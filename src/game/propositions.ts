import type { CardOutcome, CoinOutcome, DiceOutcome } from '../domain/types';

export type Proposition<TOutcome> = {
  id: string;
  label: string;
  wins: (outcome: TOutcome) => boolean;
};

const proposition = <TOutcome = any>(id: string, label: string, wins: (outcome: TOutcome) => boolean): Proposition<TOutcome> => ({ id, label, wins });

const has = (values: number[]) => (value: number) => values.includes(value);
const absoluteDifference = (first: number, second: number) => Math.abs(first - second);

export const dicePropositions: Proposition<DiceOutcome>[] = [
  ...Array.from({ length: 11 }, (_value, index) => {
    const sum = index + 2;
    return proposition(`dice-sum-${sum}`, `Sum is exactly ${sum}`, (outcome) => outcome.sum === sum);
  }),
  proposition('dice-sum-2-or-3', 'Sum is 2 or 3', ({ sum }) => has([2, 3])(sum)),
  proposition('dice-sum-3-or-11', 'Sum is 3 or 11', ({ sum }) => has([3, 11])(sum)),
  proposition('dice-sum-4-or-10', 'Sum is 4 or 10', ({ sum }) => has([4, 10])(sum)),
  proposition('dice-sum-5-or-9', 'Sum is 5 or 9', ({ sum }) => has([5, 9])(sum)),
  proposition('dice-sum-6-or-8', 'Sum is 6 or 8', ({ sum }) => has([6, 8])(sum)),
  proposition('dice-sum-6-7-8', 'Sum is 6, 7, or 8', ({ sum }) => has([6, 7, 8])(sum)),
  proposition('dice-sum-2-3-12', 'Sum is 2, 3, or 12', ({ sum }) => has([2, 3, 12])(sum)),
  proposition('dice-sum-10-11-12', 'Sum is 10, 11, or 12', ({ sum }) => has([10, 11, 12])(sum)),
  ...[5, 6, 7].map((limit) => proposition(`dice-sum-less-${limit}`, `Sum is less than ${limit}`, ({ sum }) => sum < limit)),
  ...[7, 8, 9].map((limit) => proposition(`dice-sum-greater-${limit}`, `Sum is greater than ${limit}`, ({ sum }) => sum > limit)),
  ...[[4, 7], [5, 8], [6, 9], [8, 10]].map(([low, high]) => proposition(`dice-sum-${low}-to-${high}`, `Sum is between ${low} and ${high} inclusive`, ({ sum }) => sum >= low && sum <= high)),
  proposition('dice-sum-even', 'Sum is even', ({ sum }) => sum % 2 === 0),
  proposition('dice-sum-odd', 'Sum is odd', ({ sum }) => sum % 2 === 1),
  proposition('dice-sum-prime', 'Sum is prime', ({ sum }) => has([2, 3, 5, 7, 11])(sum)),
  ...[3, 4].map((divisor) => proposition(`dice-sum-divisible-${divisor}`, `Sum is divisible by ${divisor}`, ({ sum }) => sum % divisor === 0)),
  proposition('dice-sum-multiple-5', 'Sum is a multiple of 5', ({ sum }) => sum % 5 === 0),
  proposition('dice-match', 'Both dice match', ({ die1, die2 }) => die1 === die2),
  proposition('dice-no-match', 'The dice do not match', ({ die1, die2 }) => die1 !== die2),
  ...[1, 2, 3, 4, 5, 6].map((value) => proposition(`dice-at-least-one-${value}`, `At least one die is ${value}`, ({ die1, die2 }) => die1 === value || die2 === value)),
  proposition('dice-neither-1', 'Neither die is 1', ({ die1, die2 }) => die1 !== 1 && die2 !== 1),
  ...[3, 4].map((limit) => proposition(`dice-neither-exceeds-${limit}`, `Neither die exceeds ${limit}`, ({ die1, die2 }) => die1 <= limit && die2 <= limit)),
  proposition('dice-both-exceed-3', 'Both dice exceed 3', ({ die1, die2 }) => die1 > 3 && die2 > 3),
  proposition('dice-both-at-least-2', 'Both dice are at least 2', ({ die1, die2 }) => die1 >= 2 && die2 >= 2),
  proposition('dice-both-at-most-5', 'Both dice are at most 5', ({ die1, die2 }) => die1 <= 5 && die2 <= 5),
  proposition('dice-both-even', 'Both dice are even', ({ die1, die2 }) => die1 % 2 === 0 && die2 % 2 === 0),
  proposition('dice-both-odd', 'Both dice are odd', ({ die1, die2 }) => die1 % 2 === 1 && die2 % 2 === 1),
  proposition('dice-exactly-one-even', 'Exactly one die is even', ({ die1, die2 }) => (die1 % 2 === 0) !== (die2 % 2 === 0)),
  proposition('dice-exactly-one-odd', 'Exactly one die is odd', ({ die1, die2 }) => (die1 % 2 === 1) !== (die2 % 2 === 1)),
  proposition('dice-exactly-one-greater-4', 'Exactly one die is greater than 4', ({ die1, die2 }) => (die1 > 4) !== (die2 > 4)),
  proposition('dice-at-least-one-greater-4', 'At least one die is greater than 4', ({ die1, die2 }) => die1 > 4 || die2 > 4),
  proposition('dice-one-twice-other', 'One die is exactly twice the other', ({ die1, die2 }) => die1 === die2 * 2 || die2 === die1 * 2),
  proposition('dice-one-three-times-other', 'One die is exactly three times the other', ({ die1, die2 }) => die1 === die2 * 3 || die2 === die1 * 3),
  ...[1, 2, 3].map((difference) => proposition(`dice-one-${difference}-greater`, `One die is ${difference === 1 ? 'one' : difference === 2 ? 'two' : 'three'} greater than the other`, ({ die1, die2 }) => absoluteDifference(die1, die2) === difference)),
  ...[1, 2, 3].map((difference) => proposition(`dice-difference-${difference}`, `The absolute difference is exactly ${difference}`, ({ die1, die2 }) => absoluteDifference(die1, die2) === difference)),
  proposition('dice-difference-at-least-3', 'The absolute difference is at least 3', ({ die1, die2 }) => absoluteDifference(die1, die2) >= 3),
  proposition('dice-difference-at-most-1', 'The absolute difference is at most 1', ({ die1, die2 }) => absoluteDifference(die1, die2) <= 1),
  ...[3, 4, 5, 6].map((value) => proposition(`dice-max-${value}`, `The maximum die is ${value}`, ({ die1, die2 }) => Math.max(die1, die2) === value)),
  ...[1, 2, 3].map((value) => proposition(`dice-min-${value}`, `The minimum die is ${value}`, ({ die1, die2 }) => Math.min(die1, die2) === value)),
  proposition('dice-min-at-least-2', 'The minimum die is at least 2', ({ die1, die2 }) => Math.min(die1, die2) >= 2),
  proposition('dice-max-at-most-4', 'The maximum die is at most 4', ({ die1, die2 }) => Math.max(die1, die2) <= 4),
  proposition('dice-product-even', 'Product is even', ({ die1, die2 }) => (die1 * die2) % 2 === 0),
  proposition('dice-product-odd', 'Product is odd', ({ die1, die2 }) => (die1 * die2) % 2 === 1),
  ...[10, 12, 15, 20].map((limit) => proposition(`dice-product-greater-${limit}`, `Product is greater than ${limit}`, ({ die1, die2 }) => die1 * die2 > limit)),
  proposition('dice-product-less-10', 'Product is less than 10', ({ die1, die2 }) => die1 * die2 < 10),
  ...[3, 4, 5].map((divisor) => proposition(`dice-product-divisible-${divisor}`, `Product is divisible by ${divisor}`, ({ die1, die2 }) => (die1 * die2) % divisor === 0)),
  proposition('dice-product-perfect-square', 'Product is a perfect square', ({ die1, die2 }) => Number.isInteger(Math.sqrt(die1 * die2))),
  proposition('dice-product-multiple-6', 'Product is a multiple of 6', ({ die1, die2 }) => (die1 * die2) % 6 === 0),
];

const coinText = (outcome: CoinOutcome) => outcome.join('');
const heads = (outcome: CoinOutcome) => outcome.filter((face) => face === 'H').length;
const tails = (outcome: CoinOutcome) => 3 - heads(outcome);

export const coinPropositions: Proposition<CoinOutcome>[] = [
  proposition('coin-all-identical', 'All three flips are identical', ([a, b, c]) => a === b && b === c),
  ...['H', 'T'].map((face) => proposition<CoinOutcome>(`coin-all-${face === 'H' ? 'heads' : 'tails'}`, `All three flips are ${face === 'H' ? 'heads' : 'tails'}`, (outcome) => outcome.every((value) => value === face))),
  proposition('coin-more-heads', 'More heads than tails', (outcome) => heads(outcome) > tails(outcome)),
  proposition('coin-more-tails', 'More tails than heads', (outcome) => tails(outcome) > heads(outcome)),
  ...[1, 2, 3].map((count) => proposition(`coin-exactly-${count}-heads`, `Exactly ${count} ${count === 1 ? 'head' : 'heads'}`, (outcome) => heads(outcome) === count)),
  proposition('coin-no-heads', 'No heads', (outcome) => heads(outcome) === 0),
  ...[1, 2, 3].map((count) => proposition(`coin-exactly-${count}-tails`, `Exactly ${count} ${count === 1 ? 'tail' : 'tails'}`, (outcome) => tails(outcome) === count)),
  proposition('coin-no-tails', 'No tails', (outcome) => tails(outcome) === 0),
  proposition('coin-at-least-one-head', 'At least one head', (outcome) => heads(outcome) >= 1),
  proposition('coin-at-least-one-tail', 'At least one tail', (outcome) => tails(outcome) >= 1),
  ...([['first', 0], ['middle', 1], ['last', 2]] as const).flatMap(([name, index]) => [
    proposition(`coin-${name}-heads`, `${name[0].toUpperCase()}${name.slice(1)} flip is heads`, (outcome) => outcome[index] === 'H'),
    proposition(`coin-${name}-tails`, `${name[0].toUpperCase()}${name.slice(1)} flip is tails`, (outcome) => outcome[index] === 'T'),
  ]),
  proposition('coin-first-last-match', 'First and last flips match', ([first, , last]) => first === last),
  proposition('coin-first-last-differ', 'First and last flips differ', ([first, , last]) => first !== last),
  proposition('coin-first-two-match', 'First two flips match', ([first, second]) => first === second),
  proposition('coin-first-two-differ', 'First two flips differ', ([first, second]) => first !== second),
  proposition('coin-last-two-match', 'Last two flips match', ([, second, third]) => second === third),
  proposition('coin-last-two-differ', 'Last two flips differ', ([, second, third]) => second !== third),
  proposition('coin-middle-matches-first', 'The middle flip matches the first', ([first, middle]) => middle === first),
  proposition('coin-middle-matches-last', 'The middle flip matches the last', ([, middle, last]) => middle === last),
  proposition('coin-middle-differs-outside', 'The middle flip differs from both outside flips', ([first, middle, last]) => middle !== first && middle !== last),
  proposition('coin-outside-match', 'Both outside flips match', ([first, , last]) => first === last),
  proposition('coin-outside-match-middle-differs', 'Both outside flips match and the middle differs', ([first, middle, last]) => first === last && middle !== first),
  proposition('coin-alternating', 'All three flips alternate', (outcome) => coinText(outcome) === 'HTH' || coinText(outcome) === 'THT'),
  ...['HH', 'TT', 'HT', 'TH'].map((sequence) => proposition(`coin-contains-${sequence.toLowerCase()}`, `Sequence contains ${sequence}`, (outcome) => coinText(outcome).includes(sequence))),
  ...['HH', 'TT', 'HT', 'TH'].flatMap((sequence) => [
    proposition(`coin-first-two-${sequence.toLowerCase()}`, `The first two flips are ${sequence}`, (outcome) => coinText(outcome).slice(0, 2) === sequence),
    proposition(`coin-last-two-${sequence.toLowerCase()}`, `The last two flips are ${sequence}`, (outcome) => coinText(outcome).slice(1) === sequence),
  ]),
  proposition('coin-heads-consecutive', 'Heads occur consecutively', (outcome) => coinText(outcome).includes('HH')),
  proposition('coin-tails-consecutive', 'Tails occur consecutively', (outcome) => coinText(outcome).includes('TT')),
  proposition('coin-no-hh', 'There is no HH sequence', (outcome) => !coinText(outcome).includes('HH')),
  proposition('coin-no-tt', 'There is no TT sequence', (outcome) => !coinText(outcome).includes('TT')),
  proposition('coin-one-adjacent-match', 'There is exactly one adjacent matching pair', ([first, second, third]) => Number(first === second) + Number(second === third) === 1),
  proposition('coin-both-adjacent-match', 'Both adjacent pairs match', ([first, second, third]) => first === second && second === third),
  proposition('coin-neither-adjacent-match', 'Neither adjacent pair matches', ([first, second, third]) => first !== second && second !== third),
  proposition('coin-at-least-one-adjacent-match', 'At least one adjacent pair matches', ([first, second, third]) => first === second || second === third),
  ...['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'].map((sequence) => proposition(`coin-exact-${sequence.toLowerCase()}`, `Exact sequence is ${sequence}`, (outcome) => coinText(outcome) === sequence)),
];

const values = ({ cards }: CardOutcome) => cards.map((card) => card.value) as [number, number, number];
const allDifferent = (items: number[]) => new Set(items).size === items.length;
const matchCount = (items: number[]) => new Set(items).size;

export const cardPropositions: Proposition<CardOutcome>[] = [
  proposition('card-sum-even', 'Sum is even', ({ sum }) => sum % 2 === 0),
  proposition('card-sum-odd', 'Sum is odd', ({ sum }) => sum % 2 === 1),
  ...[10, 15, 20, 25, 30, 35].map((limit) => proposition(`card-sum-above-${limit}`, `Sum is above ${limit}`, ({ sum }) => sum > limit)),
  ...[15, 20, 25, 30].map((limit) => proposition(`card-sum-below-${limit}`, `Sum is below ${limit}`, ({ sum }) => sum < limit)),
  ...[[10, 20], [15, 25], [20, 30], [25, 35], [30, 39]].map(([low, high]) => proposition(`card-sum-${low}-to-${high}`, `Sum is between ${low} and ${high} inclusive`, ({ sum }) => sum >= low && sum <= high)),
  ...[3, 4, 5].map((divisor) => proposition(`card-sum-divisible-${divisor}`, `Sum is divisible by ${divisor}`, ({ sum }) => sum % divisor === 0)),
  proposition('card-product-even', 'Product is even', ({ product }) => product % 2 === 0),
  proposition('card-product-odd', 'Product is odd', ({ product }) => product % 2 === 1),
  ...[10, 20, 25, 40, 50, 75, 100].map((limit) => proposition(`card-product-above-${limit}`, `Product is above ${limit}`, ({ product }) => product > limit)),
  ...[20, 25, 50].map((limit) => proposition(`card-product-below-${limit}`, `Product is below ${limit}`, ({ product }) => product < limit)),
  ...[3, 4, 5, 10].map((divisor) => proposition(`card-product-divisible-${divisor}`, `Product is divisible by ${divisor}`, ({ product }) => product % divisor === 0)),
  proposition('card-product-perfect-square', 'Product is a perfect square', ({ product }) => Number.isInteger(Math.sqrt(product))),
  proposition('card-product-multiple-6', 'Product is a multiple of 6', ({ product }) => product % 6 === 0),
  proposition('card-first-greater-second', 'First card is greater than the second', (outcome) => values(outcome)[0] > values(outcome)[1]),
  proposition('card-first-less-second', 'First card is less than the second', (outcome) => values(outcome)[0] < values(outcome)[1]),
  proposition('card-first-equals-second', 'First card equals the second', (outcome) => values(outcome)[0] === values(outcome)[1]),
  ...([['third', 2, 'first', 0], ['third', 2, 'second', 1]] as const).flatMap(([leftName, leftIndex, rightName, rightIndex]) => [
    proposition(`card-${leftName}-greater-${rightName}`, `${leftName[0].toUpperCase()}${leftName.slice(1)} card is greater than the ${rightName}`, (outcome) => values(outcome)[leftIndex] > values(outcome)[rightIndex]),
    proposition(`card-${leftName}-less-${rightName}`, `${leftName[0].toUpperCase()}${leftName.slice(1)} card is less than the ${rightName}`, (outcome) => values(outcome)[leftIndex] < values(outcome)[rightIndex]),
  ]),
  ...([['first', 0], ['second', 1], ['third', 2]] as const).flatMap(([name, index]) => [
    proposition(`card-${name}-greater-both`, `${name[0].toUpperCase()}${name.slice(1)} card is greater than both other cards`, (outcome) => values(outcome)[index] > values(outcome)[(index + 1) % 3] && values(outcome)[index] > values(outcome)[(index + 2) % 3]),
    proposition(`card-${name}-less-both`, `${name[0].toUpperCase()}${name.slice(1)} card is less than both other cards`, (outcome) => values(outcome)[index] < values(outcome)[(index + 1) % 3] && values(outcome)[index] < values(outcome)[(index + 2) % 3]),
    proposition(`card-${name}-largest`, `${name[0].toUpperCase()}${name.slice(1)} card is the largest`, (outcome) => values(outcome)[index] > values(outcome)[(index + 1) % 3] && values(outcome)[index] > values(outcome)[(index + 2) % 3]),
    proposition(`card-${name}-smallest`, `${name[0].toUpperCase()}${name.slice(1)} card is the smallest`, (outcome) => values(outcome)[index] < values(outcome)[(index + 1) % 3] && values(outcome)[index] < values(outcome)[(index + 2) % 3]),
  ]),
  proposition('card-strictly-increasing', 'Card values are strictly increasing', (outcome) => { const [a, b, c] = values(outcome); return a < b && b < c; }),
  proposition('card-strictly-decreasing', 'Card values are strictly decreasing', (outcome) => { const [a, b, c] = values(outcome); return a > b && b > c; }),
  proposition('card-first-two-increasing', 'First two cards are increasing', (outcome) => values(outcome)[0] < values(outcome)[1]),
  proposition('card-first-two-decreasing', 'First two cards are decreasing', (outcome) => values(outcome)[0] > values(outcome)[1]),
  proposition('card-last-two-increasing', 'Last two cards are increasing', (outcome) => values(outcome)[1] < values(outcome)[2]),
  proposition('card-last-two-decreasing', 'Last two cards are decreasing', (outcome) => values(outcome)[1] > values(outcome)[2]),
  proposition('card-third-between', 'Third card falls between the first two values', (outcome) => { const [a, b, c] = values(outcome); return (a < c && c < b) || (b < c && c < a); }),
  proposition('card-first-between', 'First card falls between the other two values', (outcome) => { const [a, b, c] = values(outcome); return (b < a && a < c) || (c < a && a < b); }),
  proposition('card-second-between', 'Second card falls between the other two values', (outcome) => { const [a, b, c] = values(outcome); return (a < b && b < c) || (c < b && b < a); }),
  proposition('card-all-match', 'All three card values match', (outcome) => matchCount(values(outcome)) === 1),
  proposition('card-all-different', 'All three card values are different', (outcome) => allDifferent(values(outcome))),
  proposition('card-at-least-two-match', 'At least two card values match', (outcome) => matchCount(values(outcome)) < 3),
  proposition('card-exactly-two-match', 'Exactly two card values match', (outcome) => matchCount(values(outcome)) === 2),
  ...([[0, 1, 'first-second'], [0, 2, 'first-third'], [1, 2, 'second-third']] as const).map(([first, second, name]) => proposition(`card-${name}-match`, `${name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' and ')} cards match`, (outcome) => values(outcome)[first] === values(outcome)[second])),
  proposition('card-no-pair-match', 'No two card values match', (outcome) => allDifferent(values(outcome))),
  proposition('card-all-even', 'All three cards are even', (outcome) => values(outcome).every((value) => value % 2 === 0)),
  proposition('card-all-odd', 'All three cards are odd', (outcome) => values(outcome).every((value) => value % 2 === 1)),
  ...[1, 2].map((count) => proposition(`card-exactly-${count}-even`, `Exactly ${count} ${count === 1 ? 'card is' : 'cards are'} even`, (outcome) => values(outcome).filter((value) => value % 2 === 0).length === count)),
  proposition('card-at-least-one-even', 'At least one card is even', (outcome) => values(outcome).some((value) => value % 2 === 0)),
  proposition('card-at-least-one-odd', 'At least one card is odd', (outcome) => values(outcome).some((value) => value % 2 === 1)),
  ...([[0, 1, 'first-second'], [0, 2, 'first-third'], [1, 2, 'second-third']] as const).map(([first, second, name]) => proposition(`card-${name}-same-parity`, `${name.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' and ')} cards have the same parity`, (outcome) => values(outcome)[first] % 2 === values(outcome)[second] % 2)),
  proposition('card-all-same-parity', 'All three cards have the same parity', (outcome) => values(outcome).every((value) => value % 2 === values(outcome)[0] % 2)),
  proposition('card-first-two-sum-exceeds-third', 'Sum of the first two cards exceeds the third', (outcome) => { const [a, b, c] = values(outcome); return a + b > c; }),
  proposition('card-first-two-sum-less-third', 'Sum of the first two cards is less than the third', (outcome) => { const [a, b, c] = values(outcome); return a + b < c; }),
  proposition('card-third-equals-first-two-sum', 'Third card equals the sum of the first two', (outcome) => { const [a, b, c] = values(outcome); return c === a + b; }),
  proposition('card-first-third-sum-exceeds-second', 'First card plus third card exceeds the second', (outcome) => { const [a, b, c] = values(outcome); return a + c > b; }),
  proposition('card-first-two-difference-1', 'First card and second card differ by exactly 1', (outcome) => absoluteDifference(values(outcome)[0], values(outcome)[1]) === 1),
  proposition('card-first-two-difference-5', 'First card and second card differ by at least 5', (outcome) => absoluteDifference(values(outcome)[0], values(outcome)[1]) >= 5),
  proposition('card-range-at-least-5', 'Highest card minus lowest card is at least 5', (outcome) => Math.max(...values(outcome)) - Math.min(...values(outcome)) >= 5),
  proposition('card-range-at-most-3', 'Highest card minus lowest card is at most 3', (outcome) => Math.max(...values(outcome)) - Math.min(...values(outcome)) <= 3),
  proposition('card-product-greater-sum', 'The first two cards have a product greater than the total sum', ({ product, sum }) => product > sum),
  proposition('card-sum-greater-twice-third', 'The total sum is greater than twice the third card', (outcome) => outcome.sum > 2 * values(outcome)[2]),
];

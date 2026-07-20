# Optiver-Style Betting Game

A React, TypeScript, and Vite trading-interview practice game. The player allocates wagers across two dice, three coin flips, three drawn cards, and a quoted card-sum market. All positions resolve together when the round is submitted.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Tests

```bash
npm run test
```

## Production Build

```bash
npm run build
```

## Game Rules

The starting state is:

- Bankroll: `$2,298.00`
- Cumulative P&L: `$0.00`
- Current wagers: `$0.00`
- Round number: `1`

Each round generates:

- Two independent fair six-sided dice. Dice bets use the sum.
- Three independent fair coin flips.
- Three cards drawn without replacement from a fresh standard 52-card deck.
- A card-sum market that settles against the sum of the three card values.

Multiple overlapping binary wagers can win in the same round.

## Odds Convention

Displayed odds are net profit odds written as `x:1`.

For wager `W`:

- Winning profit is `W * x`
- Losing profit is `-W`
- The returned stake is not counted as profit

Example: a `$10` wager at `2.7:1` earns `+$27` if it wins and `-$10` if it loses.

All odds and starting settings live in `src/config/gameConfig.ts`.

## Market Settlement

The card-sum market is quoted as:

```text
21 @ 23
```

- Bid: `21`
- Ask: `23`
- Sell P&L: `sellVolume * (21 - realizedCardSum)`
- Buy P&L: `buyVolume * (realizedCardSum - 23)`
- Volume is worth `$1` per point

The app allows both buy and sell volume and displays the resulting net position and live P&L range.

## Risk Control

Before submission, the app calculates:

- Total binary wagers
- Net market position
- Worst-case market loss across all possible card sums from `3` through `39`
- Maximum total round loss
- Remaining bankroll after worst-case loss

Submission is blocked when the maximum possible round loss exceeds the current bankroll or when the round has no positions.

## Practice Mode

Assessment Mode shows only odds and wager controls.

Practice Mode also shows exact, enumerated analytics for every binary wager:

- True probability
- Decimal payout
- Break-even probability
- Expected profit per `$1`
- Expected return percentage
- EV label

Dice probabilities enumerate all `36` ordered dice outcomes. Coin probabilities enumerate all `8` ordered flip outcomes. Card probabilities enumerate ordered pairs of distinct physical cards from the full deck.

The optional strategy helper ranks bets by expected return, win probability, and full Kelly fraction. It does not place wagers automatically.

## Important Assumptions

- Dice section uses the sum of two fair six-sided dice.
- Cards are drawn without replacement from a fresh 52-card deck each round.
- Ace = `1`, Jack = `11`, Queen = `12`, King = `13`.
- Market volume is worth `$1` per point.
- Odds represent net profit odds.
- Multiple overlapping wagers can win in the same round.
- History is in memory for the current browser session only.

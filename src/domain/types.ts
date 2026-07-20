export type ProfitOdds = number;
export type Wager = number;

export type BetCategory = 'Dice' | 'Coin' | 'Cards';

export type DiceOutcome = {
  die1: number;
  die2: number;
  sum: number;
};

export type CoinFace = 'H' | 'T';
export type CoinOutcome = [CoinFace, CoinFace, CoinFace];

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type PlayingCard = {
  rank: Rank;
  suit: Suit;
  value: number;
};

export type CardOutcome = {
  cards: [PlayingCard, PlayingCard, PlayingCard];
  product: number;
  sum: number;
};

export type BinaryBetDefinition<TOutcome> = {
  id: string;
  category: BetCategory;
  label: string;
  odds: ProfitOdds;
  wins: (outcome: TOutcome) => boolean;
};

export type BetSettlement = {
  category: BetCategory;
  position: string;
  wager: number;
  result: string;
  status: 'Won' | 'Lost';
  odds: ProfitOdds;
  pnl: number;
};

export type MarketPosition = {
  sellVolume: number;
  buyVolume: number;
};

export type MarketSettlement = {
  sellVolume: number;
  buyVolume: number;
  bid: number;
  ask: number;
  realizedSum: number;
  sellPnl: number;
  buyPnl: number;
  pnl: number;
};

export type RoundPositions = {
  diceWagers: Record<string, Wager>;
  coinWagers: Record<string, Wager>;
  cardWagers: Record<string, Wager>;
  market: MarketPosition;
};

export type RoundResult = {
  roundNumber: number;
  dice: DiceOutcome;
  coins: CoinOutcome;
  cards: CardOutcome;
  binarySettlements: BetSettlement[];
  marketSettlement: MarketSettlement;
  binaryPnl: number;
  marketPnl: number;
  totalPnl: number;
  bankrollAfter: number;
  totalBinaryWagers: number;
};

export type RoundHistoryEntry = RoundResult;

export type RandomSource = {
  int: (maxExclusive: number) => number;
};

export type PracticeMetric = {
  betId: string;
  trueProbability: number;
  decimalPayout: number;
  breakEvenProbability: number;
  expectedProfitPerDollar: number;
  expectedReturnPercentage: number;
  evLabel: 'Positive EV' | 'Negative EV' | 'Fair';
  kellyFraction: number;
};

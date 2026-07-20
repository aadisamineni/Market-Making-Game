import { MARKET_CONFIG } from '../config/gameConfig';
import type { MarketPosition, RoundPositions } from '../domain/types';
import { marketPnlRange, netMarketPosition, settleMarket } from '../game/market';

export const totalBinaryWagers = (positions: RoundPositions): number =>
  [...Object.values(positions.diceWagers), ...Object.values(positions.coinWagers), ...Object.values(positions.cardWagers)]
    .reduce((total, wager) => total + wager, 0);

export const worstCaseMarketPnl = (
  position: MarketPosition,
  minSum = MARKET_CONFIG.minCardSum,
  maxSum = MARKET_CONFIG.maxCardSum,
): number => {
  let worst = Infinity;
  for (let sum = minSum; sum <= maxSum; sum += 1) {
    worst = Math.min(worst, settleMarket(position, sum).pnl);
  }
  return worst;
};

export const worstCaseMarketLoss = (position: MarketPosition): number => Math.max(0, -worstCaseMarketPnl(position));

export const maximumRoundLoss = (positions: RoundPositions): number =>
  totalBinaryWagers(positions) + worstCaseMarketLoss(positions.market);

export const remainingBankrollAfterWorstCase = (bankroll: number, positions: RoundPositions): number =>
  bankroll - maximumRoundLoss(positions);

export const marketRiskSummary = (position: MarketPosition) => ({
  netPosition: netMarketPosition(position),
  worstCaseLoss: worstCaseMarketLoss(position),
  range: marketPnlRange(position),
});

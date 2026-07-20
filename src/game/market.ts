import { MARKET_CONFIG } from '../config/gameConfig';
import type { MarketPosition, MarketSettlement } from '../domain/types';

export const settleMarket = (
  position: MarketPosition,
  realizedSum: number,
  bid = MARKET_CONFIG.bid,
  ask = MARKET_CONFIG.ask,
): MarketSettlement => {
  const sellPnl = position.sellVolume * (bid - realizedSum);
  const buyPnl = position.buyVolume * (realizedSum - ask);
  return {
    ...position,
    bid,
    ask,
    realizedSum,
    sellPnl,
    buyPnl,
    pnl: sellPnl + buyPnl,
  };
};

export const netMarketPosition = ({ buyVolume, sellVolume }: MarketPosition): number => buyVolume - sellVolume;

export const marketPnlRange = (
  position: MarketPosition,
  minSum = MARKET_CONFIG.minCardSum,
  maxSum = MARKET_CONFIG.maxCardSum,
): { min: number; max: number } => {
  const pnls: number[] = [];
  for (let sum = minSum; sum <= maxSum; sum += 1) {
    pnls.push(settleMarket(position, sum).pnl);
  }
  return { min: Math.min(...pnls), max: Math.max(...pnls) };
};

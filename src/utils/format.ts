export const formatUsd = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatSignedUsd = (value: number): string => {
  const formatted = formatUsd(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatNumber = (value: number, digits = 2): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatPercent = (value: number, digits = 2): string => `${formatNumber(value * 100, digits)}%`;

export const formatOdds = (odds: number): string => `${formatNumber(odds, odds % 1 === 0 ? 1 : 1)}:1`;

/**
 * 格式化货币显示（澳元）
 */
export const formatAUDCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * 转换为澳元显示（在价格前加AUD $符号）
 */
export const toAUD = (amount: number): string => {
  return `AUD $${amount.toFixed(2)}`;
};

/**
 * 转换金额为Stripe所需格式（分为单位）
 */
export const toStripeCurrency = (amount: number): number => {
  return Math.round(amount * 100);
}; 
/**
 * Currency configuration — change here to switch currencies globally.
 */
export const CURRENCY = {
  code: 'TND',
  symbol: 'TND',
  locale: 'fr-TN',
  decimals: 3, // Tunisian dinar uses 3 decimal places (millimes)
} as const;

/**
 * Format a number as TND. Examples:
 *   formatPrice(42)      → "42.000 TND"
 *   formatPrice(42.5)    → "42.500 TND"
 *   formatPrice(1234.99) → "1,234.990 TND"
 */
export function formatPrice(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return `0.000 ${CURRENCY.symbol}`;
  return `${n.toFixed(CURRENCY.decimals)} ${CURRENCY.symbol}`;
}

/**
 * Same as formatPrice but symbol first (some UI surfaces prefer this).
 */
export function formatPriceShort(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return `0 ${CURRENCY.symbol}`;
  return `${n.toFixed(CURRENCY.decimals)} ${CURRENCY.symbol}`;
}

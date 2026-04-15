import { currentRegionConfig } from '@/shared/config/region';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
};

/**
 * Get currency symbol based on currency code
 * @param currencyCode - ISO 4217 currency code (USD, EUR, RUB, etc.)
 * @returns Currency symbol (e.g., $, €, ₽)
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  if (currencyCode && currencyCode.toUpperCase() !== 'XXX') {
    return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] ?? currencyCode;
  }
  return (
    CURRENCY_SYMBOLS[currentRegionConfig.baseCurrency] ??
    currentRegionConfig.baseCurrency
  );
};

/**
 * Format monetary value with scale suffix and currency symbol
 * @param value - Numeric value (can be negative)
 * @param scale - Scale suffix (e.g., "M" / "B" or localized "млн" / "млрд")
 * @param currencyCode - ISO 4217 currency code
 * @param formatNumber - Function to format the number (e.g., with comma separator)
 * @returns Formatted string (e.g., "−32.25 M $")
 */
export const formatMonetaryValue = (
  value: number | null | undefined,
  scale: string,
  currencyCode?: string,
  formatNumber?: (val: number) => string
): string => {
  if (value === null || value === undefined) return '—';

  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formattedValue = formatNumber
    ? formatNumber(absValue)
    : absValue.toFixed(2);
  const currencySymbol = getCurrencySymbol(currencyCode);

  return `${isNegative ? '−' : ''}${formattedValue} ${scale} ${currencySymbol}`;
};

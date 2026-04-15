import * as formatLocale from '@/shared/utils/formatLocale';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';

/**
 * Format utilities — thin wrappers around formatLocale.ts.
 * Accept an optional `locale` param (BCP 47, e.g. 'en-US').
 * When omitted, defaults to 'en-US'.
 */

export const formatCurrency = (
  amount: number,
  currency = '$',
  locale = 'en-US'
): string => {
  const symbolToCode: Record<string, string> = {
    $: 'USD',
    '€': 'EUR',
    '₽': 'RUB',
    '£': 'GBP',
    '¥': 'JPY',
  };
  const currencyCode = symbolToCode[currency] ?? currency;
  return formatLocale.formatCurrency(amount, locale, currencyCode);
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Parse UTC date string — adds 'Z' if no timezone present.
 */
const parseUTCDate = (dateString: string): Date => {
  if (dateString.endsWith('Z') || dateString.includes('+')) {
    return new Date(dateString);
  }
  return new Date(dateString + 'Z');
};

/**
 * Format date in local time (short format).
 * EN: Oct 22, 2025, 5:49 PM   RU: 22 окт. 2025 г., 17:49
 */
export const formatDate = (
  dateString: string,
  locale = getDateLocaleTag()
): string => {
  return parseUTCDate(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date and time in local time (full format).
 * EN: 10/22/2025, 5:49:58 PM   RU: 22.10.2025, 17:49:58
 */
export const formatDateTime = (
  dateString: string,
  locale = getDateLocaleTag()
): string => {
  return parseUTCDate(dateString).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format ticker price with currency symbol.
 * EN: $1,234.56   RU: 1 234,56 ₽
 */
export const formatTickerPrice = (
  price: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return formatLocale.formatCurrency(price, locale, currency);
};

/**
 * Format ticker percent change with locale-aware decimal separator.
 */
export const formatTickerPercent = (
  percent: number,
  locale = 'en-US'
): string => {
  return formatLocale.formatNumber(percent, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Adds https:// to a URL if no protocol is present.
 */
export const normalizeUrl = (url: string): string => {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
};

export const { getLocaleTag } = formatLocale;
export { getDateLocaleTag } from '@/shared/utils/formatLocale';

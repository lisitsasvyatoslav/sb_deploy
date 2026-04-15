/**
 * Locale-aware formatting utilities.
 * All functions accept a `locale` string (BCP 47 tag, e.g. 'en-US', 'ru-RU').
 * Derive locale via getLocaleTag(i18n.language) in components.
 */

import { REGION } from '@/shared/config/region';

/** Map i18next language code to a BCP 47 locale tag */
export function getLocaleTag(lang?: string): string {
  switch (lang) {
    case 'ru':
      return 'ru-RU';
    case 'en':
    default:
      return 'en-US';
  }
}

/**
 * Like getLocaleTag, but region-aware for date ordering.
 * On RU deployment, always returns 'ru-RU' so dates display as DD/MM/YYYY
 * regardless of the user's UI language.
 * On US deployment, behaves identically to getLocaleTag.
 */
export function getDateLocaleTag(lang?: string): string {
  if (REGION === 'ru') return 'ru-RU';
  return getLocaleTag(lang);
}

/** Format a number with locale-aware separators */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a currency amount.
 * EN: $1,234.56   RU: 1 234,56 ₽
 * Defaults to USD when no currencyCode provided.
 * Falls back to plain number formatting when the code is not a valid ISO 4217
 * currency (e.g. crypto tickers like "CCAAVE" from CCXT adapters).
 */
export function formatCurrency(
  amount: number,
  locale: string,
  currencyCode = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ${currencyCode}`;
  }
}

/**
 * Format a date string or Date object.
 * EN default: M/D/YYYY   RU default: DD.MM.YYYY
 */
export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return d.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format a time portion only.
 * EN: 2:45 PM   RU: 14:45
 */
export function formatTime(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleTimeString(locale, defaultOptions);
}

/**
 * Format date + time together.
 * EN: 3/2/2026, 2:45 PM   RU: 02.03.2026, 14:45
 */
export function formatDateTime(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleString(locale, defaultOptions);
}

/**
 * Format a percentage value.
 * EN: +12.34%   RU: +12,34%
 * Does NOT prepend the sign automatically — pass the raw value.
 */
export function formatPercent(
  value: number,
  locale: string,
  decimals = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

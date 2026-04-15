import React from 'react';
import {
  formatNumber as fmtNumber,
  formatPercent as fmtPercent,
  getLocaleTag,
  getDateLocaleTag,
} from '@/shared/utils/formatLocale';
import classNames from 'classnames';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';

// ===== Types =====

export type ColAlign = 'left' | 'center' | 'right';

// ===== CSS Constants =====

export const cellText =
  'text-[12px] leading-[16px] font-medium tracking-[-0.2px]';
export const cellTextPrimary = `${cellText} text-blackinverse-a100`;
export const cellTextSecondary = `${cellText} text-blackinverse-a56`;

export const thClass = (align: ColAlign) =>
  classNames(
    'py-3 px-4 text-[8px] leading-[12px] font-semibold text-blackinverse-a32 uppercase tracking-[-0.2px] whitespace-nowrap',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    }
  );

export const tdClass = (align: ColAlign, extra?: string) =>
  classNames(
    'py-3 px-4',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    },
    extra
  );

export const flexJustify = (align: ColAlign) =>
  align === 'left'
    ? 'justify-start'
    : align === 'right'
      ? 'justify-end'
      : 'justify-center';

// ===== Currency Utilities =====

export const currencySymbol = (currency?: string | null): string =>
  getCurrencySymbol(currency ?? undefined);

// ===== Format Utilities =====

export const formatNumber = (
  value: string | number | null | undefined,
  decimals = 2,
  locale = 'en-US'
): string => {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return fmtNumber(num, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format an asset quantity (shares / crypto units).
 * Integers show without decimals; fractional values show up to 18 decimals
 * (enough for ETH/wei-level precision). Trailing zeros are stripped
 * automatically by Intl.NumberFormat, so typical values stay readable:
 *   1 ETH → "1", 0.00123 BTC → "0.00123", 100 SBER → "100".
 *
 * NOTE: JavaScript Number loses precision beyond ~15-17 significant digits,
 * so values stored as strings are parsed with parseFloat and will round at
 * the edge of Number precision. For true 18-decimal accuracy, upstream would
 * need to pass a BigInt / big.js value — out of scope here.
 */
export const formatQuantity = (
  value: string | number | null | undefined,
  locale = 'en-US'
): string => {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return fmtNumber(num, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  });
};

export const formatCurrency = (
  value: string | null | undefined,
  decimals = 2,
  currency?: string,
  locale = 'en-US'
): string =>
  value
    ? `${formatNumber(value, decimals, locale)}${currencySymbol(currency)}`
    : '—';

export const formatValueWithSign = (
  value: string | null | undefined,
  formatter: (n: number) => string
): React.JSX.Element => {
  if (!value) return <span className={cellTextSecondary}>—</span>;
  const n = parseFloat(value);
  const isPositive = n >= 0;
  return (
    <span
      className={`${cellText} ${
        isPositive ? 'text-status-success' : 'text-status-negative'
      }`}
    >
      {isPositive ? '+' : ''}
      {formatter(n)}
    </span>
  );
};

export const formatPercent = (
  value: string | null | undefined,
  locale = 'en-US'
): React.JSX.Element =>
  formatValueWithSign(value, (n) => `${fmtPercent(n, locale)}%`);

export const formatMoney = (
  value: string | null | undefined,
  locale = 'en-US',
  currency?: string
): React.JSX.Element =>
  formatValueWithSign(
    value,
    (n) =>
      `${fmtNumber(n, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currencySymbol(currency)}`
  );

export const formatDateTime = (timestamp: string, locale = getDateLocaleTag()): string => {
  const date = new Date(timestamp);
  const d = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const t = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${d} ${t}`;
};

export const getExchange = (symbol: string): string => {
  const parts = symbol.split('@');
  return parts.length > 1 ? parts[1] : '—';
};

export const sideColor = (side: 'buy' | 'sell') =>
  side === 'buy' ? 'text-status-success' : 'text-status-negative';

export const pnlColor = (value: number) =>
  value >= 0 ? 'text-status-success' : 'text-status-negative';

export { getLocaleTag };

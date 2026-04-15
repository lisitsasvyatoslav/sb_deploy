import { getClientRegionConfig } from '@/shared/config/region';

const LOCALE_MAP = { ru: 'ru-RU', en: 'en-US' } as const;

export function getFormattingLocale(): string {
  return LOCALE_MAP[getClientRegionConfig().defaultLocale] ?? 'ru-RU';
}

/**
 * Currency symbol table. Unknown codes fall through to the ISO code itself
 * (e.g., "USDT 20,16") so values are never silently misrepresented.
 */
const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  BTC: '₿',
  USDT: 'USDT ',
  USDC: 'USDC ',
};

function getSymbol(currency: string | null | undefined): string {
  if (!currency) return '₽';
  return CURRENCY_SYMBOL[currency] ?? `${currency} `;
}

export function formatCurrency(
  value: number | null,
  currency: string | null = 'RUB'
): string {
  if (value === null) return '—';
  const symbol = getSymbol(currency);
  const formatted = value.toLocaleString(getFormattingLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Symbols with trailing space (USDT/USDC/unknown ISO codes) already include spacing.
  return symbol.endsWith(' ')
    ? `${symbol}${formatted}`
    : `${symbol} ${formatted}`;
}

export function formatPnl(
  value: number | null,
  currency: string | null = 'RUB'
): string {
  if (value === null) return '';
  const symbol = getSymbol(currency);
  // Match `formatCurrency` spacing: single-glyph symbols (₽ $ €) get a space
  // between symbol and amount; multi-char codes already include a trailing
  // space (e.g. "USDT "), so we don't double up.
  const separator = symbol.endsWith(' ') ? '' : ' ';
  if (value === 0) return `${symbol}${separator}0`;
  const arrow = value > 0 ? '↑' : '↓';
  const sign = value > 0 ? '+' : '';
  const abs = Math.abs(value).toLocaleString(getFormattingLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${arrow} ${sign}${symbol}${separator}${abs}`;
}

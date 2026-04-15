/**
 * Signal feature constants
 * Centralized constants to avoid magic strings and improve maintainability
 */

// Signal source types (must match backend SignalSourceType enum values)
export const SIGNAL_SOURCE_TYPES = {
  TRADINGVIEW: 'tradingview' as const,
  TELEGRAM: 'telegram' as const,
} as const;

export type SignalSourceType =
  (typeof SIGNAL_SOURCE_TYPES)[keyof typeof SIGNAL_SOURCE_TYPES];

// Default display name i18n keys (namespace: 'board')
// Translate at the component level: t(SIGNAL_DEFAULT_NAMES.TRADINGVIEW)
export const SIGNAL_DEFAULT_NAMES = {
  TRADINGVIEW: 'signalConstants.tradingView',
  TELEGRAM: 'signalConstants.telegram',
  NEW_SIGNAL: 'signalConstants.newSignal',
} as const;

// Signal payload field names (for data extraction)
export const SIGNAL_PAYLOAD_FIELDS = {
  TEXT: 'text',
  TICKER: 'ticker',
} as const;

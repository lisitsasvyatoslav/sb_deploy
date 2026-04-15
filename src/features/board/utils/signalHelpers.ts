import {
  SIGNAL_DEFAULT_NAMES,
  SIGNAL_PAYLOAD_FIELDS,
} from '../constants/signalConstants';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';

/**
 * Helper functions for signal card data processing
 */

/**
 * Extract display title from signal payload
 * Returns text field (text is always present)
 */
export function getSignalTitle(payload: Record<string, unknown>): string {
  const text = payload[SIGNAL_PAYLOAD_FIELDS.TEXT];
  if (text && typeof text === 'string') {
    return text;
  }

  // Fallback for empty/invalid payload
  return SIGNAL_DEFAULT_NAMES.NEW_SIGNAL;
}

/**
 * Get ticker from signal payload if present
 */
export function getSignalTicker(
  payload: Record<string, unknown>
): string | null {
  return payload[SIGNAL_PAYLOAD_FIELDS.TICKER]
    ? String(payload[SIGNAL_PAYLOAD_FIELDS.TICKER])
    : null;
}

/**
 * Format signal timestamp for display
 * Returns: "DD.MM.YYYY HH:MM" format
 */
export function formatSignalTime(isoString: string, locale = getDateLocaleTag()): string {
  const date = new Date(isoString);
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get source configuration for signal card styling
 */
export function getSourceConfig(
  sourceType: 'tradingview' | 'telegram',
  description?: string
) {
  const configs = {
    tradingview: {
      logo: '/images/trading-view-white-logo.svg',
      name: description || SIGNAL_DEFAULT_NAMES.TRADINGVIEW,
      headerBg: 'var(--surfacemedium-surfacemedium2)',
    },
    telegram: {
      logo: '/images/telegram-logo.svg',
      name: description || SIGNAL_DEFAULT_NAMES.TELEGRAM,
      headerBg: '#2AABEE',
    },
  };

  return configs[sourceType];
}

/**
 * Ticker utilities for parsing and formatting trading symbols
 */

/**
 * Extract ticker from symbol like "LKOH@MISX" -> "lkoh"
 * @param symbol - Full symbol with exchange (e.g. "LKOH@MISX", "SBER@MOEX")
 * @returns Lowercase ticker without exchange
 */
export function getTickerFromSymbol(symbol: string): string {
  // Remove exchange part after @
  const ticker = symbol.split('@')[0];
  return ticker.toLowerCase();
}

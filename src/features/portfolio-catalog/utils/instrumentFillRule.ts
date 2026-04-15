import type { PortfolioFillRule } from '@/types/portfolio';

/**
 * Reads instrument tickers from portfolio fillRule (entity shape: { type: 'instrument', filter: { symbols } }).
 */
export function symbolsFromPortfolioFillRule(
  fillRule: PortfolioFillRule | undefined | null
): string[] {
  if (!fillRule || fillRule.type !== 'instrument') {
    return [];
  }
  const symbols = fillRule.filter?.symbols;
  if (!Array.isArray(symbols)) {
    return [];
  }
  return symbols.filter(
    (s): s is string => typeof s === 'string' && s.length > 0
  );
}

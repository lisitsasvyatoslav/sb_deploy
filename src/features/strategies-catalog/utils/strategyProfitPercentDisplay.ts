export interface FormatSignedProfitPercentOptions {
  decimals?: number;
  decimalSeparator?: '.' | ',';
  /** Whole numbers render without a fractional part (e.g. +5% instead of +5.0%). */
  compactWholeNumbers?: boolean;
}

/**
 * Renders annual / signed profit % without "+%" prefix on negatives (avoids "+-5.2%").
 */
export function formatSignedProfitPercent(
  value: number,
  options?: FormatSignedProfitPercentOptions
): string {
  const decimals = options?.decimals ?? 1;
  const sep = options?.decimalSeparator ?? '.';
  const compactWholeNumbers = options?.compactWholeNumbers ?? false;

  const abs = Math.abs(value);
  const isWhole = abs % 1 === 0;

  let body: string;
  if (compactWholeNumbers && isWhole) {
    body = String(Math.round(abs));
  } else {
    const raw = abs.toFixed(decimals);
    body = sep === ',' ? raw.replace('.', ',') : raw;
  }

  if (value > 0) return `+${body}%`;
  if (value < 0) return `-${body}%`;
  return `${body}%`;
}

/** Tailwind classes aligned with ticker P/L (e.g. TickerPickerModal). */
export function getProfitPercentColorClass(value: number): string {
  if (value > 0) return 'text-status-success';
  if (value < 0) return 'text-status-negative';
  return 'text-blackinverse-a100';
}

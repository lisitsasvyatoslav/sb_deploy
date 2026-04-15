import type { PeriodType, PortfolioValuePoint } from '@/types';
import type { ChartDataPoint } from './types';

export function flattenByBroker(
  byBroker: Record<string, PortfolioValuePoint[]> | undefined
): ChartDataPoint[] {
  if (!byBroker) return [];

  const dateMap = new Map<string, { total: number; ff: boolean }>();

  // When backend provides an "all" aggregate key, use it directly
  // to avoid double-counting (all = sum of individual brokers)
  const seriesToSum = byBroker['all'] ? { all: byBroker['all'] } : byBroker;

  for (const points of Object.values(seriesToSum)) {
    for (const p of points) {
      if (p.value == null) continue;
      const isFF = !!p.isForwardFilled;
      const existing = dateMap.get(p.date);
      if (existing) {
        existing.total += p.value;
        if (!isFF) existing.ff = false;
      } else {
        dateMap.set(p.date, { total: p.value, ff: isFF });
      }
    }
  }

  const sorted = Array.from(dateMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return sorted.map(([date, { total, ff }], i) => {
    const prev = i > 0 ? sorted[i - 1][1] : null;
    const isBoundary = prev && prev.ff !== ff;

    return {
      date,
      value: total,
      realValue: ff && !isBoundary ? null : total,
      ffValue: !ff && !isBoundary ? null : total,
      isForwardFilled: ff,
    };
  });
}

export function formatAxisValue(value: number, locale: string): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return (
      new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
        value / 1_000_000
      ) + 'M'
    );
  }
  if (abs >= 1_000) {
    return (
      new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
        value / 1_000
      ) + 'K'
    );
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
    value
  );
}

export function formatCurrencyValue(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatXLabel(
  dateStr: string,
  period: PeriodType,
  locale: string
): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (period === '2d') {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }
  if (period === '1w' || period === '1m') {
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

export function formatTooltipDate(
  dateStr: string,
  period: PeriodType,
  locale: string
): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (period === '2d') {
    return d.toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function computeRoi(
  data: ChartDataPoint[]
): { roi: number; pnl: number } | null {
  if (data.length < 2) return null;
  const first = data[0].value;
  const last = data[data.length - 1].value;
  if (first === 0) return null;
  return {
    roi: ((last - first) / Math.abs(first)) * 100,
    pnl: last - first,
  };
}

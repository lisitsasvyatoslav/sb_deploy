import type { PeriodType } from '@/types';

export interface ChartDataPoint {
  date: string;
  value: number;
  /** Real data point value — null for forward-filled segments */
  realValue: number | null;
  /** Forward-filled value — null for real data points */
  ffValue: number | null;
  isForwardFilled?: boolean;
}

export interface PortfolioChartSettingsData {
  portfolioId?: string;
  accountId?: string;
  benchmarks: string[];
}

export interface ChartTooltipInnerProps {
  period: PeriodType;
  locale: string;
}

export type BenchmarkLabelKey =
  | 'chart.benchmarks.sp500'
  | 'chart.benchmarks.nasdaq100'
  | 'chart.benchmarks.totalMarket'
  | 'chart.benchmarks.bitcoin'
  | 'chart.benchmarks.ethereum'
  | 'chart.benchmarks.gold'
  | 'chart.benchmarks.bonds'
  | 'chart.benchmarks.6040';

export type BenchmarkTitleKey =
  | 'chart.benchmarks.indexes'
  | 'chart.benchmarks.crypto'
  | 'chart.benchmarks.otherAssets';

export interface BenchmarkItem {
  id: string;
  labelKey: BenchmarkLabelKey;
}

export interface BenchmarkCategory {
  titleKey: BenchmarkTitleKey;
  items: BenchmarkItem[];
}

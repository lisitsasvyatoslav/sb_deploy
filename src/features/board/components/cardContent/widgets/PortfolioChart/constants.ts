import type { PeriodType } from '@/types';
import type { BenchmarkCategory, BenchmarkLabelKey } from './types';

export const PERIODS: PeriodType[] = [
  '2d',
  '1w',
  '1m',
  '6m',
  '1y',
  '3y',
  'all',
];

export const BENCHMARK_DROPDOWN_ITEMS: {
  labelKey: BenchmarkLabelKey;
  value: string;
}[] = [
  { labelKey: 'chart.benchmarks.sp500', value: 'sp500' },
  { labelKey: 'chart.benchmarks.totalMarket', value: 'totalMarket' },
];

export const BENCHMARK_CATEGORIES: BenchmarkCategory[] = [
  {
    titleKey: 'chart.benchmarks.indexes',
    items: [
      { id: 'sp500', labelKey: 'chart.benchmarks.sp500' },
      { id: 'nasdaq100', labelKey: 'chart.benchmarks.nasdaq100' },
      { id: 'totalMarket', labelKey: 'chart.benchmarks.totalMarket' },
    ],
  },
  {
    titleKey: 'chart.benchmarks.crypto',
    items: [
      { id: 'bitcoin', labelKey: 'chart.benchmarks.bitcoin' },
      { id: 'ethereum', labelKey: 'chart.benchmarks.ethereum' },
    ],
  },
  {
    titleKey: 'chart.benchmarks.otherAssets',
    items: [
      { id: 'gold', labelKey: 'chart.benchmarks.gold' },
      { id: 'bonds', labelKey: 'chart.benchmarks.bonds' },
      { id: '60_40', labelKey: 'chart.benchmarks.6040' },
    ],
  },
];

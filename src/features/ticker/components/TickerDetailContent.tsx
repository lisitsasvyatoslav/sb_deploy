import React, { lazy, Suspense } from 'react';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import type { SparklineDataPoint } from '@/types/ticker';

const SparklineChart = lazy(() => import('./SparklineChart'));

/* ── Formatting helpers ── */

const formatPrice = (price: number, locale: string) =>
  price.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

const formatPercent = (percent: number, locale: string) =>
  percent.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-status-success';
  if (change < 0) return 'text-status-negative';
  return 'text-[var(--text-secondary)]';
};

/* ── Types ── */

type ChartPeriod = 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all';

export interface TickerDetailContentProps {
  chartData: {
    sparkline?: SparklineDataPoint[];
    price: number;
    currency: string;
    priceChange: number;
    priceChangePercent: number;
    yearlyChange: number;
    yearlyChangePercent: number;
    ticker?: string;
  };
  periods: Array<{ key: string; label: string }>;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: string) => void;
  locale: string;
  /** Translation function — accepts i18next TFunction or plain (key) => string */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

/* ── Component ── */

const TickerDetailContent: React.FC<TickerDetailContentProps> = ({
  chartData,
  periods,
  selectedPeriod,
  onPeriodChange,
  locale,
  t,
}) => {
  return (
    <div className="flex flex-col gap-6 px-8 py-4 h-full overflow-auto">
      {/* Period selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => onPeriodChange(period.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-[var(--text-primary)] text-[var(--surfacegray-high)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--blackinverse-a4)]'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        <div className="h-[280px] w-full rounded-xl flex items-center justify-center overflow-hidden">
          {chartData.sparkline && chartData.sparkline.length > 0 ? (
            <Suspense fallback={null}>
              <SparklineChart
                data={chartData.sparkline}
                height={280}
                showTooltip={true}
                period={selectedPeriod}
              />
            </Suspense>
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">
              {t('info.chartUnavailable')}
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics in Two Columns */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-[var(--text-primary)] tracking-[-0.128px]">
              {formatPrice(chartData.price, locale)}{' '}
              {getCurrencySymbol(chartData.currency)}
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.currentPrice')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className={`text-base font-medium tracking-[-0.128px] ${getChangeColor(chartData.priceChange)}`}
            >
              {chartData.priceChange > 0 ? '+' : ''}
              {formatPrice(chartData.priceChange, locale)}{' '}
              {getCurrencySymbol(chartData.currency)}
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.dailyChange')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className={`text-base font-medium tracking-[-0.128px] ${getChangeColor(chartData.priceChangePercent)}`}
            >
              {chartData.priceChangePercent > 0 ? '+' : ''}
              {formatPercent(chartData.priceChangePercent, locale)}%
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.dailyChangePct')}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span
              className={`text-base font-medium tracking-[-0.128px] ${getChangeColor(chartData.yearlyChange)}`}
            >
              {chartData.yearlyChange > 0 ? '+' : ''}
              {formatPrice(chartData.yearlyChange, locale)}{' '}
              {getCurrencySymbol(chartData.currency)}
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.yearlyChange')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className={`text-base font-medium tracking-[-0.128px] ${getChangeColor(chartData.yearlyChangePercent)}`}
            >
              {chartData.yearlyChangePercent > 0 ? '+' : ''}
              {formatPercent(chartData.yearlyChangePercent, locale)}%
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.yearlyChangePct')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-[var(--text-primary)] tracking-[-0.128px]">
              {getCurrencySymbol(chartData.currency)}
            </span>
            <span className="text-base font-normal text-[var(--text-secondary)] tracking-[-0.128px]">
              {t('info.tradingCurrency')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickerDetailContent;

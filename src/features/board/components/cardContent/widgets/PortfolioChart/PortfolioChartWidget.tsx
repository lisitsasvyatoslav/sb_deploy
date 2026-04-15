'use client';

import { useTranslation } from '@/shared/i18n/client';
import { usePortfolioValueHistoryQuery } from '@/features/statistics/queries';
import { useChartThemeColors } from '@/shared/hooks/useChartThemeColors';
import { resolveThemeColor } from '@/shared/utils/resolveThemeColor';
import { cn } from '@/shared/utils/cn';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { PortfolioConfigureDropdown } from '@/features/statistics/components/PortfolioConfigureDropdown';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { PeriodType } from '@/types';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltipContent } from './ChartTooltipContent';
import { PERIODS } from './constants';
import {
  flattenByBroker,
  formatAxisValue,
  formatXLabel,
  computeRoi,
} from './utils';

export const PortfolioChartWidget: React.FC = () => {
  const { t, i18n } = useTranslation('portfolio');
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const chartColors = useChartThemeColors();

  // Collision-safe gradient ID (TD-1044 pattern)
  const instanceId = useId().replace(/:/g, '');
  const gradientIdReal = `pcGradient-${instanceId}`;
  const gradientIdFF = `pcGradientFF-${instanceId}`;

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('1m');

  // Live clock for footer timestamp — updates every 60s
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const selectedPortfolioId = useStatisticsStore(
    (state) => state.selectedPortfolioId
  );
  const { data, isLoading, isError, refetch } = usePortfolioValueHistoryQuery({
    period: selectedPeriod,
    portfolioId: selectedPortfolioId,
  });

  const chartData = useMemo(() => flattenByBroker(data?.byBroker), [data]);
  const metrics = useMemo(() => computeRoi(chartData), [chartData]);

  // Brand-localized chart color: resolves --mind-accent at runtime so it switches
  // between purple (Finam) and lime (LIMEX) when data-brand attribute changes.
  const brandColorCss = useMemo(
    () => resolveThemeColor('--mind-accent') || '#7863f6',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartColors] // chartColors object changes on theme switch → re-resolve
  );

  // Total portfolio value — last data point
  const totalValue = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1].value;
  }, [chartData]);

  const setPortfolioTotalValue = useStatisticsStore(
    (state) => state.setPortfolioTotalValue
  );
  useEffect(() => {
    setPortfolioTotalValue(totalValue);
    return () => setPortfolioTotalValue(null);
  }, [totalValue, setPortfolioTotalValue]);

  // Y-axis domain with 5% padding
  const yDomain = useMemo<[number, number] | undefined>(() => {
    if (chartData.length === 0) return undefined;
    const values = chartData.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.05 || 1;
    return [min - padding, max + padding];
  }, [chartData]);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Empty / Error / Loading states ──

  const hasData = chartData.length > 0;

  if (isError && !hasData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-spacing-12">
        <span className="text-14 text-blackinverse-a56">
          {t('chart.noDataShort')}
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-radius-4 px-spacing-12 py-spacing-4 text-12 font-medium bg-mind-accent text-white"
        >
          {t('chart.retry')}
        </button>
      </div>
    );
  }

  // ── Render ──

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col overflow-clip rounded-radius-4 bg-surfacelow-surfacelow1"
    >
      {/* ── Toolbar: period | chips (centred) | benchmark ── */}
      <div className="flex items-center justify-between px-spacing-8 pt-spacing-8 pb-spacing-2">
        <Dropdown
          items={PERIODS.map((p) => ({
            label: t(`chart.period.${p}`),
            value: p,
          }))}
          selectedValue={selectedPeriod}
          onSelect={(v) => setSelectedPeriod(v as PeriodType)}
          placement="bottom"
          trigger={({ isOpen, onClick, triggerRef }) => (
            <button
              ref={triggerRef}
              onClick={onClick}
              type="button"
              className="flex items-center gap-spacing-6 rounded-radius-2 px-spacing-8 py-spacing-6 text-10 leading-12 tracking-tight-1 text-blackinverse-a100 transition-colors"
            >
              <span>{t(`chart.period.${selectedPeriod}`)}</span>
              <Icon
                variant="chevronDownSmall"
                size={20}
                className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        />

        <div className="flex items-center gap-spacing-8">
          {metrics && (
            <>
              <span className="rounded-radius-4 px-spacing-6 py-spacing-2 text-12 font-medium bg-blackinverse-a4 text-mind-accent">
                {metrics.roi >= 0 ? '+' : ''}
                {metrics.roi.toFixed(2)}% ROI
              </span>
              <span
                className={cn(
                  'rounded-radius-4 px-spacing-6 py-spacing-2 text-12 font-medium bg-blackinverse-a4',
                  metrics.pnl >= 0
                    ? 'text-status-success'
                    : 'text-status-negative'
                )}
              >
                {metrics.pnl >= 0 ? '+' : ''}
                {formatAxisValue(metrics.pnl, locale)}
                {getCurrencySymbol()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Chart area ── */}
      <div className="relative flex-1 min-h-0 overflow-clip">
        {isLoading && !hasData ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-12 text-blackinverse-a56">
              {t('chart.loading')}
            </span>
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-14 text-blackinverse-a56">
              {t('chart.noData')}
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, bottom: 32, left: 0 }}
            >
              <defs>
                <linearGradient id={gradientIdReal} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={brandColorCss}
                    stopOpacity={0.24}
                  />
                  <stop
                    offset="100%"
                    stopColor={brandColorCss}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id={gradientIdFF} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={brandColorCss}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="100%"
                    stopColor={brandColorCss}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--stroke-a12)"
                strokeDasharray="4 4"
                vertical={true}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) =>
                  formatXLabel(v, selectedPeriod, locale)
                }
                tick={{ fontSize: 9, fill: chartColors.axisText }}
                tickLine={false}
                axisLine={{ stroke: 'var(--stroke-a12)' }}
                dy={8}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                orientation="right"
                width={54}
                tickFormatter={(v: number) => formatAxisValue(v, locale)}
                tick={{ fontSize: 9, fill: chartColors.axisText }}
                tickLine={false}
                axisLine={{ stroke: 'var(--stroke-a12)' }}
                domain={yDomain}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    period={selectedPeriod}
                    locale={locale}
                  />
                }
                cursor={{
                  stroke: chartColors.axisText,
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Area
                type="monotone"
                dataKey="realValue"
                stroke="var(--mind-accent)"
                strokeWidth={1.5}
                fill={`url(#${gradientIdReal})`}
                isAnimationActive={false}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="ffValue"
                stroke="var(--mind-accent)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeOpacity={0.5}
                fill={`url(#${gradientIdFF})`}
                isAnimationActive={false}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-spacing-20 py-spacing-8 h-[44px] /* no token for 44 */">
        <div className="flex items-center gap-spacing-8">
          <PortfolioConfigureDropdown />
        </div>
        <div className="flex items-center gap-spacing-8 text-10 font-medium tracking-tight-1 text-blackinverse-a32">
          <span>
            {now.toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="inline-block w-spacing-2 h-spacing-2 rounded-full bg-current" />
          <span>
            {now.toLocaleDateString(locale, {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

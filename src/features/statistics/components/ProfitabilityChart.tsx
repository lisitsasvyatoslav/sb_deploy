import Button from '@/shared/ui/Button';
import { useBrokerAccountsQuery } from '@/features/broker/queries';
import { useChartThemeColors } from '@/shared/hooks/useChartThemeColors';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { PeriodType, PortfolioValueHistoryResponse } from '@/types';
import { Menu, MenuItem } from '@mui/material';
import { useTheme } from 'next-themes';
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  formatXAxisLabel,
  generateFullDateRange,
  generateLabels,
  normalizeDateString,
} from '@/features/statistics/utils/chartHelpers';
import ProfitabilityChartIllustration from './ProfitabilityChartIllustration';
import ProfitabilityChartSkeleton from './ProfitabilityChartSkeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfitabilityChartProps {
  data: PortfolioValueHistoryResponse | null;
  isLoading?: boolean;
  onPeriodChange?: (period: PeriodType) => void;
  selectedPeriod?: PeriodType;
}

/* brand-color: per-broker identity, no theme switching */
const BROKER_COLORS: Record<string, string> = {
  finam: '#2DACE7',
  't-invest': '#EE8F4C',
  demo: '#A22DF7',
  index: '#26C69A',
  sp500: '#E838C0',
};

const ProfitabilityChart: React.FC<ProfitabilityChartProps> = ({
  data,
  isLoading = false,
  onPeriodChange,
  selectedPeriod = 'all',
}) => {
  const { t, i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);
  const chartColors = useChartThemeColors();
  const { resolvedTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hiddenBrokers, setHiddenBrokers] = useState<Set<string>>(new Set());

  const PERIODS: { value: PeriodType; label: string; daysBack: number }[] =
    useMemo(
      () => [
        { value: 'all', label: t('dateRange.allTime'), daysBack: 0 },
        { value: '2d', label: t('dateRange.twoDays'), daysBack: 2 },
        { value: '1w', label: t('dateRange.week'), daysBack: 7 },
        { value: '1m', label: t('dateRange.oneMonth'), daysBack: 30 },
        { value: '6m', label: t('dateRange.sixMonths'), daysBack: 180 },
        { value: '1y', label: t('dateRange.oneYear'), daysBack: 365 },
        { value: '3y', label: t('dateRange.threeYears'), daysBack: 1095 },
      ],
      [t]
    );

  const { data: brokerAccounts, isSuccess } = useBrokerAccountsQuery();
  const hasBrokerAccounts =
    isSuccess && !!brokerAccounts && brokerAccounts.length > 0;

  const isDataSyncInProgress = useStatisticsStore(
    (state) => state.isDataSyncInProgress
  );

  // Store the total data range from "all" period response (the broadest view)
  const [totalDays, setTotalDays] = useState<number | null>(null);

  // Update totalDays only when we get data for the "all" period
  useEffect(() => {
    if (selectedPeriod === 'all' && data?.dateFrom && data?.dateTo) {
      const from = new Date(data.dateFrom).getTime();
      const to = new Date(data.dateTo).getTime();
      setTotalDays(Math.ceil((to - from) / (1000 * 60 * 60 * 24)));
    }
  }, [selectedPeriod, data?.dateFrom, data?.dateTo]);

  // Always show all periods — missing data is filled with zeros
  const availablePeriods = PERIODS;

  const handlePeriodClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePeriodClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodSelect = (period: PeriodType) => {
    onPeriodChange?.(period);
    handlePeriodClose();
  };

  const toggleBroker = (broker: string) => {
    setHiddenBrokers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(broker)) {
        newSet.delete(broker);
      } else {
        newSet.add(broker);
      }
      return newSet;
    });
  };

  const chartData = useMemo(() => {
    if (!data || !data.byBroker || !data.dateFrom || !data.dateTo) {
      return { labels: [], datasets: [], tickDates: [] };
    }

    const fullDateRange = generateFullDateRange(
      data.dateFrom,
      data.dateTo,
      data.timeframe
    );

    const backendDates = new Set<string>();
    Object.entries(data.byBroker)
      .filter(([broker]) => broker !== 'all')
      .forEach(([, points]) => {
        points.forEach((point) =>
          backendDates.add(normalizeDateString(point.date))
        );
      });

    // Union of all dates from the full range + dates from backend
    // This ensures correct scaling and data preservation
    const allDatesSet = new Set([
      ...fullDateRange,
      ...Array.from(backendDates),
    ]);
    const sortedDates = Array.from(allDatesSet).sort();

    // Generate labels for the X axis (may filter for readability)
    const tickDates = generateLabels(
      sortedDates,
      data.period as PeriodType,
      data,
      backendDates
    );

    const labels = tickDates.map((dateStr) =>
      formatXAxisLabel(
        dateStr,
        data.period as PeriodType,
        data.timeframe,
        locale
      )
    );

    // Exclude the "all" aggregate key — individual broker lines are shown separately
    const datasets = Object.entries(data.byBroker)
      .filter(([broker]) => broker !== 'all')
      .map(([broker, points]) => {
        const pointsMap = new Map(
          points.map((p) => [normalizeDateString(p.date), p])
        );

        const brokerData = tickDates.map((date) => {
          const point = pointsMap.get(date);
          return point && point.value !== null ? point.value : null;
        });

        return {
          label: broker,
          data: brokerData,
          borderColor:
            BROKER_COLORS[broker.toLowerCase()] || chartColors.axisText,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
          hidden: hiddenBrokers.has(broker),
          spanGaps: true,
        };
      });

    return { labels, datasets, tickDates };
  }, [data, hiddenBrokers, chartColors, locale]);

  const yAxisRange = useMemo(() => {
    if (
      !data ||
      !data.byBroker ||
      !chartData.tickDates ||
      chartData.tickDates.length === 0
    )
      return null;

    let min = Infinity;
    let max = -Infinity;
    const tickDatesSet = new Set(chartData.tickDates);

    Object.entries(data.byBroker)
      .filter(([broker]) => broker !== 'all')
      .forEach(([, points]) => {
        points.forEach((point) => {
          if (
            tickDatesSet.has(normalizeDateString(point.date)) &&
            point.value !== null
          ) {
            if (point.value > max) max = point.value;
            if (point.value < min) min = point.value;
          }
        });
      });

    if (min === Infinity || max === -Infinity) return null;

    // Add 5% padding above and below for visual breathing room
    const range = max - min;
    const padding = range > 0 ? range * 0.05 : max * 0.1;
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    };
  }, [data, chartData.tickDates]);

  const options: ChartOptions<'line'> = useMemo(() => {
    const period = selectedPeriod;

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.tooltipText,
          bodyColor: chartColors.tooltipText,
          borderColor: chartColors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (value === null || value === undefined) return '';

              const formatted = new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value);
              return `${context.dataset.label}: ${formatted}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: (context) => {
              const label = context.tick.label;
              const isYear = /^\d{4}$/.test(label?.toString() || '');
              return isYear ? chartColors.axisEmphasis : chartColors.axisText;
            },
            font: (context) => {
              const label = context.tick.label;
              const isYear = /^\d{4}$/.test(label?.toString() || '');
              return {
                size: 10,
                weight: isYear ? 'bold' : 'normal',
              };
            },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit:
              period === '1m' || period === '2d' ? 8 : period === '1w' ? 7 : 12,
            autoSkipPadding: 10,
          },
        },
        y: {
          position: 'right',
          min: yAxisRange?.min,
          max: yAxisRange?.max,
          grid: {
            display: false,
            drawTicks: false,
            drawBorder: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: chartColors.axisText,
            font: {
              size: 10,
              weight: 500,
            },
            padding: 8,
            align: 'end',
            crossAlign: 'far',
            callback: (value) => {
              const numValue = Number(value);
              if (numValue >= 1000000) {
                return (
                  new Intl.NumberFormat(locale, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }).format(numValue / 1000000) + 'M'
                );
              } else if (numValue >= 1000) {
                return new Intl.NumberFormat(locale, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(numValue);
              } else {
                return new Intl.NumberFormat(locale, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(numValue);
              }
            },
          },
        },
      },
    };
  }, [yAxisRange, selectedPeriod, chartColors, locale]);

  const brokers = data?.byBroker
    ? Object.keys(data.byBroker).filter((b) => b !== 'all')
    : [];
  const selectedPeriodLabel =
    availablePeriods.find((period) => period.value === selectedPeriod)?.label ||
    t('dateRange.allTime');

  if (isLoading || isDataSyncInProgress) {
    return <ProfitabilityChartSkeleton />;
  }

  const hasData =
    data &&
    Object.keys(data.byBroker || {}).length > 0 &&
    !!data.dateFrom &&
    !!data.dateTo &&
    Object.values(data.byBroker).some((points) => points.length > 0);

  return (
    <div className="theme-surface theme-border rounded-2xl w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center">
          {/* Title */}
          <span className="theme-text-primary text-sm font-semibold tracking-[-0.2px] leading-5 pl-3 pr-2">
            Стоимость портфеля
          </span>
          {/* Period Dropdown */}
          {hasBrokerAccounts && (
            <Button
              onClick={handlePeriodClick}
              variant="ghost"
              size="md"
              className="!px-5 !py-3 !rounded-xl !min-w-[122px]"
            >
              <span className="theme-text-primary text-xs font-medium tracking-[-0.2px] leading-4 whitespace-nowrap">
                {selectedPeriodLabel}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M3 6L8 11L13 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="theme-text-primary"
                />
              </svg>
            </Button>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handlePeriodClose}
            PaperProps={{
              style: {
                borderRadius: '12px',
                marginTop: '4px',
              },
            }}
          >
            {availablePeriods.map((period) => (
              <MenuItem
                key={period.value}
                onClick={() => handlePeriodSelect(period.value)}
                selected={period.value === selectedPeriod}
                style={{ fontSize: '12px' }}
              >
                {period.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {/* Broker Filters */}
        <div className="flex items-center gap-0.5 mr-4">
          {brokers.map((broker) => {
            const isActive = !hiddenBrokers.has(broker);
            const color =
              BROKER_COLORS[broker.toLowerCase()] || chartColors.axisText;

            return (
              <Button
                key={broker}
                onClick={() => toggleBroker(broker)}
                variant="ghost"
                size="sm"
                className="!flex !items-center !gap-0.5 !pl-1 !pr-1.5 !py-0.5 !rounded-full h-auto"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? color : 'transparent',
                    border: isActive ? 'none' : `1px solid ${color}`,
                  }}
                />
                <span
                  className={`text-[9px] font-semibold uppercase tracking-[-0.2px] leading-3 min-w-[24px] text-center ${
                    isActive ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {broker}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chart or Empty State */}
      {!hasBrokerAccounts ? (
        // No brokers added yet - show illustration
        <div className="flex-1 flex items-center justify-center px-4 py-0">
          <div className="flex flex-col gap-2 items-center">
            <ProfitabilityChartIllustration />
            <p className="font-medium text-base leading-6 tracking-[-0.2px] theme-text-primary">
              {t('chart.chartsWillAppear')}
            </p>
            <p className="text-sm leading-5 tracking-[-0.2px] theme-text-secondary">
              {t('chart.addBrokerToSee')}
            </p>
          </div>
        </div>
      ) : hasData ? (
        // Has brokers and has data - show chart
        <div className="flex-1 pl-4 pr-6 pb-3.5 pt-2.5">
          <Line
            key={resolvedTheme}
            data={{ labels: chartData.labels, datasets: chartData.datasets }}
            options={options}
          />
        </div>
      ) : (
        // Has brokers but no data
        <div className="flex-1 flex items-center justify-center px-4 py-0">
          <span className="text-sm text-gray-400">{t('chart.noData')}</span>
        </div>
      )}
    </div>
  );
};

export default ProfitabilityChart;

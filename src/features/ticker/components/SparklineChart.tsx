import { useTranslation } from '@/shared/i18n/client';
import { useSparklineThemeColors } from '@/shared/hooks/useChartThemeColors';
import { SparklineDataPoint } from '@/types/ticker';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';

const CHART_COLORS = {
  positive: 'var(--status-success)',
  negative: 'var(--status-negative)',
  neutral: 'var(--blackinverse-a56)',
  accent: 'var(--mind-accent)',
} as const;

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

interface SparklineChartProps {
  data: SparklineDataPoint[];
  width?: number;
  height?: number;
  showTooltip?: boolean;
  isNeutralChart?: boolean;
  period?: 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all';
  customColor?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width,
  height = 32,
  showTooltip = false,
  isNeutralChart = false,
  period = 'all',
  customColor,
}) => {
  const sparkColors = useSparklineThemeColors();
  const { i18n } = useTranslation('ticker');
  const dateFnsLocale = i18n.language === 'ru' ? ru : enUS;

  if (!data || data.length === 0) return null;

  const validData = data.filter(
    (point) =>
      point.date !== undefined &&
      point.value != null &&
      !isNaN(point.value) &&
      isFinite(point.value)
  );

  if (validData.length === 0) return null;

  const values = validData.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const shouldNormalize = range > 0.001;

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    switch (period) {
      case 'D':
        return format(date, 'HH:mm', { locale: dateFnsLocale });
      case 'all':
        return format(date, 'LLL yyyy', { locale: dateFnsLocale });
      default:
        return format(date, 'd LLL', { locale: dateFnsLocale });
    }
  };

  const chartData = validData.map((point, index) => ({
    index,
    value: shouldNormalize ? (point.value - min) / range : point.value,
    originalValue: point.value,
    date: formatDate(point.date),
  }));

  // Determine color based on trend (last value vs first value)
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const trend =
    lastValue > firstValue
      ? 'positive'
      : lastValue < firstValue
        ? 'negative'
        : 'neutral';

  const baseColor =
    customColor ||
    (isNeutralChart
      ? CHART_COLORS.accent
      : trend === 'positive'
        ? CHART_COLORS.positive
        : trend === 'negative'
          ? CHART_COLORS.negative
          : CHART_COLORS.neutral);

  const gradientId = customColor
    ? 'gradientCustom'
    : isNeutralChart
      ? 'gradientAccent'
      : trend === 'positive'
        ? 'gradientPositive'
        : trend === 'negative'
          ? 'gradientNegative'
          : 'gradientNeutral';

  return (
    <div
      className="flex items-center justify-center w-full"
      style={width ? { width } : undefined}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.positive}
                stopOpacity={0.24}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.positive}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="gradientNegative" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.negative}
                stopOpacity={0.24}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.negative}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0.24}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="gradientNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.neutral}
                stopOpacity={0.24}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.neutral}
                stopOpacity={0}
              />
            </linearGradient>
            {customColor && (
              <linearGradient id="gradientCustom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={customColor} stopOpacity={0.24} />
                <stop offset="100%" stopColor={customColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <XAxis
            dataKey="index"
            hide
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis hide domain={shouldNormalize ? [0, 1] : ['auto', 'auto']} />
          {showTooltip ? (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: sparkColors.cursor, strokeWidth: 1 }}
            />
          ) : (
            <Tooltip content={() => null} />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={baseColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;

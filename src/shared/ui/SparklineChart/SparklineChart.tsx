'use client';

import React, { useId } from 'react';
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from 'recharts';

import { cn } from '@/shared/utils/cn';
import SkeletonChart from './SkeletonChart';
import type {
  SparklineChartProps,
  SparklineChartVariant,
} from './SparklineChart.types';

const LEFT_EDGE_FADE = 'linear-gradient(to right, transparent 6%, black 50%)';

function deriveVariant(data: number[]): SparklineChartVariant {
  if (data.length < 2) return 'skeleton';
  return data[data.length - 1] >= data[0] ? 'positive' : 'negative';
}

/**
 * SparklineChart — sparklineChart
 *
 * Figma node: 61083:3942
 */
const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  variant,
  showOpenLine = true,
  fadeLeft = false,
  width = 120, // 120px — fixed chart width per design
  height = 32, // h-spacing-32
  className,
  'data-testid': dataTestId,
}) => {
  const uid = useId().replace(/:/g, '');
  const gradientId = `sg-${uid}`;

  const resolvedVariant: SparklineChartVariant =
    variant ?? (data && data.length >= 2 ? deriveVariant(data) : 'skeleton');

  const isSkeleton = resolvedVariant === 'skeleton';
  const isPositive = resolvedVariant === 'positive';

  const lineColor = isSkeleton
    ? 'var(--blackinverse-a6)'
    : isPositive
      ? 'var(--colors-status_success_base)'
      : 'var(--colors-status_negative_base)';

  const maskStyle = fadeLeft
    ? { maskImage: LEFT_EDGE_FADE, WebkitMaskImage: LEFT_EDGE_FADE }
    : undefined;

  if (isSkeleton) {
    return (
      <SkeletonChart
        width={width}
        height={height}
        gradientId={gradientId}
        lineColor={lineColor}
        shadeColorFrom="var(--blackinverse-a8)"
        shadeColorTo="var(--blackinverse-a0)"
        maskStyle={maskStyle}
        className={className}
        dataTestId={dataTestId}
      />
    );
  }

  // Normalize data to [0, 1] for recharts
  const values = data ?? [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const normalize = (v: number) => (range > 0.001 ? (v - min) / range : 0.5);
  const chartData = values.map((v) => ({ value: normalize(v) }));
  const openLineValue = normalize(values[0]);

  return (
    <div
      className={cn('block shrink-0', className)}
      style={{ width, height, ...maskStyle }}
      aria-hidden="true"
      data-testid={dataTestId}
    >
      <AreaChart
        width={width}
        height={height}
        data={chartData}
        margin={{ top: 2, right: 0, bottom: 0, left: 0 }} // top: spacing-2
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.12} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis hide />
        <YAxis hide domain={[0, 1]} />
        {showOpenLine && (
          <ReferenceLine
            y={openLineValue}
            stroke={lineColor}
            strokeDasharray="2 2"
            strokeWidth={1}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1}
          strokeOpacity={1}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </div>
  );
};

export default SparklineChart;

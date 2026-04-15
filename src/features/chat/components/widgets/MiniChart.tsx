import React, { useMemo } from 'react';
import { MiniChartProps } from '@/features/chat/types/widget';
import { useChartThemeColors } from '@/shared/hooks/useChartThemeColors';

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  label,
  color: _color,
}) => {
  const chartColors = useChartThemeColors();

  const { pathD, isPositive, change } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathD: '', isPositive: true, change: 0 };
    }

    const width = 200;
    const height = 60;
    const padding = 4;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const isPositive = data[data.length - 1] >= data[0];
    const change = ((data[data.length - 1] - data[0]) / data[0]) * 100;

    return { pathD, isPositive, change };
  }, [data]);

  const chartColor = isPositive ? chartColors.positive : chartColors.negative;

  return (
    <div className="bg-background-card border border-border-light rounded-lg p-3">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">{label}</span>
          <span
            className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        </div>
      )}
      <svg
        width="100%"
        height="60"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient
            id={`gradient-${label}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        {pathD && (
          <path
            d={`${pathD} L 196,56 L 4,56 Z`}
            fill={`url(#gradient-${label})`}
          />
        )}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export default MiniChart;

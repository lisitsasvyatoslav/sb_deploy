import React from 'react';
import type { ChartDataPoint, ChartTooltipInnerProps } from './types';
import { formatTooltipDate, formatCurrencyValue } from './utils';

export const ChartTooltipContent: React.FC<
  ChartTooltipInnerProps & {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint; value?: number }>;
  }
> = ({ active, payload, period, locale }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div
      className="rounded px-2 py-1 text-xs shadow-lg"
      style={{
        background: 'var(--surfacemedium-surfacemedium)',
        color: 'var(--blackinverse-a100)',
        border: '1px solid var(--blackinverse-a12)',
      }}
    >
      <div style={{ color: 'var(--blackinverse-a56)' }}>
        {formatTooltipDate(point.date, period, locale)}
        {point.isForwardFilled && (
          <span className="ml-1 opacity-60">(est.)</span>
        )}
      </div>
      <div className="font-medium">
        {formatCurrencyValue(point.value, locale)}
      </div>
    </div>
  );
};

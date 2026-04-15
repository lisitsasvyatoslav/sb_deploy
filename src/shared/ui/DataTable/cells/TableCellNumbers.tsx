import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

type Trend = 'positive' | 'negative' | 'neutral';

const primaryColorByTrend: Record<Trend, string> = {
  positive: 'text-status-success',
  negative: 'text-status-negative',
  neutral: 'text-blackinverse-a100',
};

const subValueColorByTrend: Record<Trend, string> = {
  positive: 'text-status-success',
  negative: 'text-status-negative',
  neutral: 'text-blackinverse-a56',
};

const getTrend = (value: number): Trend => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};

/** Numeric mode: value is a number, component handles formatting + coloring */
interface TableCellNumbersNumericProps {
  value: number | null;
  /** Formats the numeric value for display. null renders "—" */
  valueFormatter: (value: number) => string;
  /** Color primary text by sign (positive=green, negative=red). Default: true */
  isActiveColor?: boolean;
  subValue?: ReactNode;
  className?: string;
}

/** Display mode: value is any ReactNode — backward-compatible, no auto-coloring */
interface TableCellNumbersDisplayProps {
  value: ReactNode;
  valueFormatter?: never;
  isActiveColor?: never;
  subValue?: ReactNode;
  /** Controls color of subValue only */
  trend?: Trend;
  className?: string;
}

export type TableCellNumbersProps =
  | TableCellNumbersNumericProps
  | TableCellNumbersDisplayProps;

/**
 * TableCellNumbers — numeric cell with optional trend-colored value
 *
 * Two modes:
 *   - **Numeric** (value: number | null, valueFormatter required):
 *     Primary text is auto-colored by sign when isActiveColor=true (default).
 *     null value renders "—".
 *   - **Display** (value: ReactNode, no valueFormatter):
 *     Primary text is always black; subValue can be trend-colored.
 *
 * Figma node: 61081:1182
 *
 * Layout: column gap=4px padding=0 4px
 *   ├── primaryRow   12px / 500 / right-aligned
 *   └── secondaryRow 10px / 500 / trend-colored / right-aligned
 */
const TableCellNumbers: React.FC<TableCellNumbersProps> = (props) => {
  if ('valueFormatter' in props && props.valueFormatter !== undefined) {
    // Numeric mode
    const {
      value,
      valueFormatter,
      isActiveColor = true,
      subValue,
      className,
    } = props;
    const displayValue = value === null ? '—' : valueFormatter(value);
    const trend = value === null ? 'neutral' : getTrend(value);
    const primaryClass = isActiveColor
      ? primaryColorByTrend[trend]
      : 'text-blackinverse-a100';

    return (
      <div
        className={cn(
          'flex flex-col items-end gap-spacing-4 px-spacing-4',
          className
        )}
      >
        <span
          className={cn(
            'text-12 leading-16 font-medium tracking-tight-1 text-right w-full',
            primaryClass
          )}
        >
          {displayValue}
        </span>
        {subValue && (
          <span
            className={cn(
              'text-[10px] leading-12 font-medium tracking-tight-1 text-right w-full',
              subValueColorByTrend[trend]
            )}
          >
            {subValue}
          </span>
        )}
      </div>
    );
  }

  // Display mode (backward compat)
  const {
    value,
    subValue,
    trend = 'neutral',
    className,
  } = props as TableCellNumbersDisplayProps;
  return (
    <div
      className={cn(
        'flex flex-col items-end gap-spacing-4 px-spacing-4',
        className
      )}
    >
      <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100 text-right w-full">
        {value}
      </span>
      {subValue && (
        <span
          className={cn(
            'text-[10px] leading-12 font-medium tracking-tight-1 text-right w-full',
            subValueColorByTrend[trend]
          )}
        >
          {subValue}
        </span>
      )}
    </div>
  );
};

export default TableCellNumbers;

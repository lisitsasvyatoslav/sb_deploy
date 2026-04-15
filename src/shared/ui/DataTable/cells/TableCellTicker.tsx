import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';
import { CloseOpenRow, TrendCaret } from '../primitives';
import TableCellSymbol from './TableCellSymbol';

interface TableCellTickerProps {
  /** Ticker symbol, e.g. "AAPL" */
  ticker: string;
  /** Security ID for TickerIcon logo resolution */
  securityId?: number;
  /** Direct icon URL (for instruments without screener entry, e.g. currency pairs) */
  iconUrl?: string;
  /** Whether the expandable row is currently open */
  isExpanded?: boolean;
  /** Toggle expand/collapse */
  onToggle?: () => void;
  /** Whether this row is selected — switches logo to checkmark */
  isSelected?: boolean;
  /** Toggle row selection — switches symbolCell to active/inactive state */
  onToggleSelect?: React.MouseEventHandler;
  /** Trend direction shown as 8×8 caret next to ticker text */
  trend?: 'up' | 'down';
  /** Custom icon slot — replaces default TableCellSymbol when provided */
  iconSlot?: ReactNode;
  /** Show "+N" badge when there are extra items */
  extraCount?: number;
  /** Extra badge renderer (defaults to internal ExtraBadge) */
  extraBadge?: ReactNode;
  className?: string;
}

/**
 * TableCellTicker — table cell with chevron toggle, ticker logo, ticker name and optional trend caret
 *
 * Figma node: 61075:46003
 *
 * Layout: row gap=6px padding=4px
 *   ├── closeOpenRow (12×12) — when onToggle provided
 *   ├── symbolCell logo (24×24)
 *   └── label frame (row gap=8px)
 *       ├── ticker text (12px / 500)
 *       └── trendCaret (8×8) — when trend provided
 */
const TableCellTicker: React.FC<TableCellTickerProps> = ({
  ticker,
  securityId,
  iconUrl,
  isExpanded,
  onToggle,
  isSelected,
  onToggleSelect,
  trend,
  iconSlot,
  extraCount,
  extraBadge,
  className,
}) => (
  <div className={cn('flex items-center gap-spacing-6 p-spacing-4', className)}>
    {onToggle && <CloseOpenRow isOpen={!!isExpanded} onClick={onToggle} />}
    {iconSlot ?? (
      <TableCellSymbol
        ticker={ticker}
        securityId={securityId}
        iconUrl={iconUrl}
        isSelected={isSelected}
        onToggle={onToggleSelect}
      />
    )}
    <span className="inline-flex items-center gap-spacing-8">
      <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100">
        {ticker}
      </span>
      {trend && <TrendCaret direction={trend} />}
    </span>
    {extraCount != null &&
      extraCount > 0 &&
      (extraBadge ?? (
        <span className="inline-flex items-center justify-center rounded-full bg-blackinverse-a12 text-blackinverse-a56 text-[8px] font-semibold tracking-[-0.2px] h-[14px] w-[15px]">
          +{extraCount}
        </span>
      ))}
  </div>
);

export default TableCellTicker;

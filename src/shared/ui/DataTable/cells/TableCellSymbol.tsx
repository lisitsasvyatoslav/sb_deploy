import { Icon } from '@/shared/ui/Icon';
import TickerIcon from '@/shared/ui/TickerIcon';
import { useState } from 'react';

interface TableCellSymbolProps {
  /** Ticker symbol, e.g. "AAPL" */
  ticker: string;
  /** Security ID for TickerIcon logo resolution */
  securityId?: number;
  /** Direct icon URL (for instruments without screener entry, e.g. currency pairs) */
  iconUrl?: string;
  /** Whether this row is selected */
  isSelected?: boolean;
  /** Toggle selection */
  onToggle?: (e: React.MouseEvent) => void;
  /**
   * table (default): default → active (selected) → inactive (selected + hovered)
   * chip: default → inactive (hovered) — for selected ticker chips, ignores active state
   */
  mode?: 'table' | 'chip';
  /** Force show inactive state (for documentation/testing) */
  defaultHovered?: boolean;
}

/**
 * TableCellSymbol — symbolCell
 *
 * Figma node: 60407:83208
 *
 * States:
 * - default: TickerIcon (not selected)
 * - active: selected — purple circle with tick icon
 * - inactive: hovered (chip mode) or selected + hovered (table mode) — circle with X icon
 */
const TableCellSymbol: React.FC<TableCellSymbolProps> = ({
  ticker,
  securityId,
  iconUrl,
  isSelected,
  onToggle,
  mode = 'table',
  defaultHovered = false,
}) => {
  const [isHovered, setIsHovered] = useState(defaultHovered);

  const handleClick = (e: React.MouseEvent) => {
    if (onToggle) {
      e.stopPropagation();
      onToggle(e);
    }
  };

  const showInactive = mode === 'chip' ? isHovered : isSelected && isHovered;
  const showActive = mode === 'table' && isSelected && !isHovered;

  if (showInactive || showActive) {
    return (
      <button
        type="button"
        className={[
          'flex items-center justify-center size-6 rounded-xl cursor-pointer shrink-0 p-0 border-none leading-none',
          showActive
            ? 'bg-brand-base'
            : 'ring-1 ring-blackinverse-a8 bg-transparent',
        ].join(' ')}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={showActive ? 'Deselect row' : 'Remove'}
      >
        {showActive ? (
          <Icon variant="tick" size={20} className="text-white" />
        ) : (
          <Icon variant="close" size={20} className="text-blackinverse-a56" />
        )}
      </button>
    );
  }

  return (
    <div
      className="flex items-center justify-center size-6 shrink-0"
      onMouseEnter={() => (mode === 'chip' || isSelected) && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TickerIcon
        symbol={ticker}
        securityId={securityId}
        iconUrl={iconUrl}
        size={24}
      />
    </div>
  );
};

export default TableCellSymbol;

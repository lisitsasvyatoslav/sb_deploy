import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useEffect, useRef, useState } from 'react';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  defaultSortDirection?: 'asc' | 'desc'; // Default direction when first clicked
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  rows: T[];
  onSort?: (columnKey: string, direction: 'asc' | 'desc' | null) => void;
  currentSort?: {
    columnKey: string;
    direction: 'asc' | 'desc';
  };
  onRowClick?: (row: T, event?: React.MouseEvent) => void;
  className?: string;
  getRowKey?: (row: T, index: number) => string | number;
  selectedRows?: (string | number)[];
  getRowId?: (row: T) => string | number;
  rowActions?: (row: T, isHovered: boolean) => React.ReactNode;
  isEqualGap?: boolean;
  isHeaderHidden?: boolean;
  expandable?: {
    expandedRowRender: (row: T) => React.ReactNode;
    expandedRows: Set<string | number>; // Controlled: parent manages expanded state
  };
  // Virtualization support
  virtualized?: {
    enabled: boolean;
    estimateSize?: number; // Estimated row height in pixels
    overscan?: number; // Number of items to render outside visible area
    onScrollEnd?: () => void; // Callback when user scrolls near the end (for infinite scroll)
    scrollEndThreshold?: number; // Number of items from end to trigger onScrollEnd
    isLoadingMore?: boolean; // Show loading indicator at the bottom
    paddingBottom?: number; // Extra space (px) at the bottom of the virtual list
  };
  // Custom class for selected rows (overrides default highlight)
  selectedRowClassName?: string;
  // Horizontal padding for header and row content (hover/selected bg spans full width)
  contentPaddingX?: string;
  // Custom container height for virtualized tables
  containerHeight?: string;
  isSubTable?: boolean;
  density?: 'default' | 'compact';
  headerClassName?: string;
  // Override gap between cells (e.g. "gap-[2px]"), takes precedence over isEqualGap
  cellGap?: string;
  // All columns get flex: 1 0 0 (equal width)
  equalColumns?: boolean;
  // Override header label text class (default: 'text-[var(--text-secondary)]')
  headerTextClassName?: string;
  // Override row height/padding class (default: density-based)
  rowClassName?: string;
  // Per-cell padding override for header cells
  headerCellClassName?: (columnKey: string, isFirstColumn: boolean) => string;
  // Per-cell padding override for row cells
  rowCellClassName?: (columnKey: string, isFirstColumn: boolean) => string;
}

function Table<T>({
  columns,
  rows,
  onSort,
  currentSort,
  onRowClick,
  className = '',
  getRowKey,
  selectedRows = [],
  getRowId,
  rowActions,
  isEqualGap = false,
  isHeaderHidden = false,
  expandable,
  virtualized,
  selectedRowClassName,
  contentPaddingX = '',
  containerHeight,
  isSubTable = false,
  density = 'default',
  headerClassName,
  cellGap,
  equalColumns = false,
  headerTextClassName,
  rowClassName,
  headerCellClassName,
  rowCellClassName,
}: TableProps<T>) {
  const { t } = useTranslation('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(
    null
  );
  const isCompact = density === 'compact';

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => virtualized?.estimateSize || 72,
    overscan: virtualized?.overscan || 5,
    enabled: virtualized?.enabled || false,
  });

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    setShowTopFade(scrollTop > 0);
    setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [rows]);

  // Infinite scroll detection for virtualized tables
  useEffect(() => {
    if (!virtualized?.enabled || !virtualized?.onScrollEnd) return;

    const virtualItems = rowVirtualizer.getVirtualItems();
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) return;

    const threshold = virtualized.scrollEndThreshold || 1;
    if (
      lastItem.index >= rows.length - threshold &&
      !virtualized.isLoadingMore
    ) {
      virtualized.onScrollEnd();
    }
  }, [
    virtualized?.enabled,
    virtualized?.onScrollEnd,
    virtualized?.isLoadingMore,
    virtualized?.scrollEndThreshold,
    rows.length,
    // We intentionally check virtualizer state by calling getVirtualItems()
    rowVirtualizer.getVirtualItems().length,
  ]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable || !onSort) return;

    let newDirection: 'asc' | 'desc' | null;

    if (currentSort && currentSort.columnKey === columnKey) {
      // Same column - toggle between asc and desc
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New column - use defaultSortDirection from column config, or fallback to 'asc'
      newDirection = column.defaultSortDirection || 'asc';
    }

    // Call parent handler
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    // Check if this column is currently sorted
    const isActiveSort = currentSort?.columnKey === columnKey;

    // Initial state: up and down chevrons
    if (!isActiveSort || !currentSort?.direction) {
      return (
        <span className="flex h-3 flex-col justify-center -my-1 text-[var(--text-secondary)]">
          <Icon variant="chevronUp" size={12} />
          <Icon variant="chevronDown" size={12} className="-mt-[6px]" />
        </span>
      );
    }

    // Active state: single chevron
    return currentSort.direction === 'asc' ? (
      <Icon
        variant="chevronUp"
        size={16}
        className="text-[var(--text-secondary)]"
      />
    ) : (
      <Icon
        variant="chevronDown"
        size={16}
        className="text-[var(--text-secondary)]"
      />
    );
  };

  return (
    <div
      className={`w-full h-full  flex flex-col overflow-hidden ${className}`}
    >
      {/* Table header - sticky within scroll container */}
      {!isHeaderHidden && (
        <div
          className={`sticky top-0 z-10 ${headerClassName || 'bg-[var(--surface-medium)]'} flex ${cellGap || (isEqualGap ? 'justify-between' : 'gap-[48px]')} ${isCompact ? 'h-8 py-0' : 'h-12 pb-2 pt-2'} items-center ${rowActions ? 'pr-8' : ''} border-b border-[var(--border-light)] flex-shrink-0 ${contentPaddingX}`}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`flex gap-1 items-center ${headerCellClassName ? headerCellClassName(column.key, column.key === columns[0].key) : isCompact ? (column.key === columns[0].key ? 'pl-2 pr-0' : 'px-1') : 'px-2'} ${
                column.align === 'right'
                  ? 'justify-end'
                  : column.align === 'center'
                    ? 'justify-center'
                    : 'justify-start'
              } ${column.sortable ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
              style={
                column.width
                  ? { width: column.width, flex: 'none' }
                  : equalColumns
                    ? { flex: '1 0 0' }
                    : { flex: column.key === columns[0].key ? 1 : 'none' }
              }
              onClick={
                column.sortable ? () => handleSort(column.key) : undefined
              }
            >
              <span
                className={`${headerTextClassName || 'text-[var(--text-secondary)]'} ${isCompact ? 'text-[8px] font-semibold leading-[12px]' : 'font-medium leading-4 text-xs'}`}
              >
                {column.label}
              </span>
              {column.sortable && (
                <div className="flex items-center justify-center w-[12px] h-[12px]">
                  {getSortIcon(column.key)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table body with scroll */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden"
        style={containerHeight ? { height: containerHeight } : {}}
      >
        {/* Top fade gradient - appears when scrolled */}
        {!virtualized?.enabled && showTopFade && (
          <div className="sticky top-0 z-20 h-8 pointer-events-none -mb-8 bg-gradient-to-b from-[var(--surface-medium)] to-transparent" />
        )}

        {/* Virtualized table content */}
        {virtualized?.enabled ? (
          <div
            className="w-full relative"
            style={{
              height: `${rowVirtualizer.getTotalSize() + (virtualized.paddingBottom ?? 0)}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              const rowKey = getRowKey
                ? getRowKey(row, virtualRow.index)
                : virtualRow.index;
              const rowId = getRowId ? getRowId(row) : rowKey;
              const isSelected = selectedRows.includes(rowId);
              const isHovered = hoveredRowId === rowId;

              return (
                <div
                  key={rowKey}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onMouseEnter={() => setHoveredRowId(rowId)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <div
                    className={`py-0 transition-colors relative ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? selectedRowClassName ||
                          'bg-[var(--brand-primary-light)]'
                        : 'hover:bg-[var(--brand-primary-hover-bg)]'
                    }`}
                    onClick={(e) => onRowClick?.(row, e)}
                  >
                    <div
                      className={`flex items-center border-t border-[var(--border-light)] ${rowClassName || (isCompact ? 'h-12 py-0' : 'py-4')} ${rowActions ? 'pr-8' : ''} ${cellGap || (isEqualGap ? 'justify-between' : 'gap-[48px]')} ${contentPaddingX}`}
                    >
                      {columns.map((column) => (
                        <div
                          key={column.key}
                          className={`flex ${rowCellClassName ? rowCellClassName(column.key, column.key === columns[0].key) : isCompact ? (column.key === columns[0].key ? 'pl-2 pr-0' : 'px-1') : 'px-2'} ${
                            column.align === 'right'
                              ? 'justify-end'
                              : column.align === 'center'
                                ? 'justify-center'
                                : 'justify-start'
                          }`}
                          style={
                            column.width
                              ? { width: column.width, flex: 'none' }
                              : equalColumns
                                ? { flex: '1 0 0' }
                                : {
                                    flex:
                                      column.key === columns[0].key
                                        ? 1
                                        : 'none',
                                  }
                          }
                        >
                          {column.render?.(row)}
                        </div>
                      ))}
                    </div>
                    {rowActions && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        {rowActions(row, isHovered)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {virtualized.isLoadingMore && (
              <div className="py-4 text-center text-sm text-gray-500">
                {t('table.loadingMore')}
              </div>
            )}
          </div>
        ) : (
          /* Non-virtualized table content */
          <div className={`-mt-px ${isSubTable ? 'px-0' : 'px-5'}`}>
            {rows.map((row, rowIndex) => {
              const rowKey = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
              const rowId = getRowId ? getRowId(row) : rowKey;
              const isSelected = selectedRows.includes(rowId);
              const isHovered = hoveredRowId === rowId;
              const isExpanded = expandable?.expandedRows?.has(rowId) ?? false;
              return (
                <React.Fragment key={rowKey}>
                  {rowIndex !== 0 && (
                    <div className="h-[1px] mx-16 bg-[var(--border-light)] w-[calc(100%-32px)]" />
                  )}
                  <div
                    onClick={(e) => onRowClick?.(row, e)}
                    onMouseEnter={() => setHoveredRowId(rowId)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={`
                    flex gap-12 items-center px-3 py-2  relative 
                    ${onRowClick ? 'cursor-pointer transition-colors' : ''}
                    ${isSelected ? selectedRowClassName || 'bg-primary-50' : isHovered ? 'bg-gray-500/[0.06]' : ''}
                  `}
                  >
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className={`flex-1 px-4 ${
                          column.align === 'right'
                            ? 'text-right'
                            : column.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        }`}
                        style={
                          column.width
                            ? { width: column.width, flex: 'none' }
                            : {}
                        }
                      >
                        {column.render ? (
                          column.render(row)
                        ) : (
                          <span className="text-sm text-black">
                            {((row as Record<string, unknown>)[
                              column.key
                            ] as React.ReactNode) ?? ''}
                          </span>
                        )}
                      </div>
                    ))}
                    {rowActions && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        {rowActions(row, isHovered)}
                      </div>
                    )}
                  </div>
                  {expandable && isExpanded && (
                    <div className="px-3 py-4 bg-background-preview rounded-b-md ">
                      {expandable.expandedRowRender(row)}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Bottom fade gradient - appears when there's more content */}
        {!virtualized?.enabled && showBottomFade && (
          <div className="sticky bottom-0 z-20 h-8 pointer-events-none -mt-8 bg-gradient-to-t from-[var(--surface-medium)] to-transparent" />
        )}
      </div>
    </div>
  );
}

export default Table;

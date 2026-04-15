import React, { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import DataTableCell from './primitives/DataTableCell';
import DataTableHead from './primitives/DataTableHead';
import DataTableHeaderCell from './primitives/DataTableHeaderCell';
import DataTableRow from './primitives/DataTableRow';

// ===== Types =====

export type ColAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  align?: ColAlign;
  /** Extra CSS classes applied to both <th> and <td> for this column (e.g. 'w-12') */
  className?: string;
  /** When true, the column header is clickable and participates in sort state */
  sortable?: boolean;
  /** Show a checkbox in the column header (select-all pattern) */
  checkbox?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  renderCell: (
    row: T,
    isExpanded: boolean,
    toggle: () => void,
    isSelected: boolean
  ) => ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** When provided, renders additional <tr> elements below a row when it is expanded. */
  renderExpandedRows?: (row: T, isSelected: boolean) => ReactNode;
  /** Called when a row is clicked. */
  onRowClick?: (row: T, event: React.MouseEvent<HTMLTableRowElement>) => void;
  /** Set of row keys that should appear selected (highlighted background) */
  selectedKeys?: Set<string>;
  isLoading?: boolean;
  isEmpty?: boolean;
  /** Shown instead of the whole table when isLoading is true. */
  loadingFallback?: ReactNode;
  /**
   * Shown when isEmpty is true. Rendered inside the outer wrapper alongside
   * the header slot so the header remains visible while the table is empty.
   */
  emptyFallback?: ReactNode;
  /** Optional slot rendered above the <table> element (e.g. a ticker card). */
  header?: ReactNode;
  /** Current sort column key and direction. Parent controls data order. */
  sortState?: SortState;
  /** Called when a sortable column header is clicked. */
  onSort?: (key: string, direction: SortDirection) => void;
  tableHeadClassName?: string;
  /** Extra classes for the <tr> inside <thead> (overrides default bg/border). */
  tableHeadRowClassName?: string;
  /** Optional callback to add custom CSS classes to individual rows. */
  rowClassName?: (row: T) => string | undefined;
  /** Row keys that should start expanded. Only used for initial state. */
  defaultExpandedKeys?: Set<string>;
}

// ===== Component =====

/**
 * DataTable — generic sortable data table with expandable rows, hover actions, and selection.
 *
 * Figma node: 61072:40811
 */
function DataTable<T>({
  columns,
  rows,
  getRowKey,
  renderExpandedRows,
  onRowClick,
  selectedKeys,
  isLoading,
  isEmpty,
  loadingFallback,
  emptyFallback,
  header,
  sortState,
  onSort,
  tableHeadClassName,
  tableHeadRowClassName,
  rowClassName,
  defaultExpandedKeys,
}: DataTableProps<T>): React.JSX.Element {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => defaultExpandedKeys ?? new Set()
  );

  const toggle = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  if (isLoading && loadingFallback) {
    return <>{loadingFallback}</>;
  }

  if (isEmpty && emptyFallback) {
    return (
      <div className="h-full flex flex-col">
        {header}
        {emptyFallback}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        {header}
        <table className="w-full">
          <DataTableHead
            className={tableHeadClassName}
            rowClassName={tableHeadRowClassName}
          >
            {columns.map((col) => (
              <DataTableHeaderCell
                key={col.key}
                align={col.align}
                sortKey={col.sortable ? col.key : undefined}
                sortState={sortState}
                onSort={onSort}
                className={col.className}
                checkbox={col.checkbox}
                checked={col.checked}
                indeterminate={col.indeterminate}
                onCheckboxChange={col.onCheckboxChange}
              >
                {col.header}
              </DataTableHeaderCell>
            ))}
          </DataTableHead>
          <tbody>
            {rows.map((row) => {
              const key = getRowKey(row);
              const isExpanded = expandedKeys.has(key);
              const isSelected = selectedKeys?.has(key) ?? false;
              const toggleRow = () => toggle(key);

              return (
                <React.Fragment key={key}>
                  <DataTableRow
                    state={isSelected ? 'active' : 'default'}
                    onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
                    className={rowClassName?.(row)}
                  >
                    {columns.map((col) => (
                      <DataTableCell
                        key={col.key}
                        align={col.align}
                        className={col.className}
                      >
                        {col.renderCell(row, isExpanded, toggleRow, isSelected)}
                      </DataTableCell>
                    ))}
                  </DataTableRow>
                  {renderExpandedRows &&
                    isExpanded &&
                    renderExpandedRows(row, isSelected)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

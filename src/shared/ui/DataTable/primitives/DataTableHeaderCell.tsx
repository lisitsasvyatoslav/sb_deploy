import Checkbox from '@/shared/ui/Checkbox';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import React from 'react';
import type { ReactNode } from 'react';
import type { ColAlign, SortDirection, SortState } from '../DataTable';

// Intentional noop for optional checkbox onChange fallback
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface DataTableHeaderCellProps {
  children?: ReactNode;
  align?: ColAlign;
  /** When provided together with onSort, the column becomes sortable */
  sortKey?: string;
  sortState?: SortState;
  onSort?: (key: string, direction: SortDirection) => void;
  className?: string;
  /**
   * Figma: tableCell/Title Checkbox=On
   * Shows a 16×16 accent checkbox before the column title.
   * Padding shifts to 8px 4px 8px 8px and gap between checkbox and title becomes 8px.
   */
  checkbox?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}

function getSortIcon(sortKey: string, sortState?: SortState): ReactNode {
  const isActive = sortState?.key === sortKey;
  if (!isActive) {
    return (
      <Icon
        variant="chevronUpDown"
        size={12}
        className="text-blackinverse-a32 shrink-0"
        aria-hidden
      />
    );
  }
  return sortState?.direction === 'asc' ? (
    <Icon
      variant="sortUp"
      size={12}
      className="text-blackinverse-a56 shrink-0"
      aria-hidden
    />
  ) : (
    <Icon
      variant="sortDown"
      size={12}
      className="text-blackinverse-a56 shrink-0"
      aria-hidden
    />
  );
}

/**
 * DataTableHeaderCell — base <th> primitive with optional sort control.
 *
 * Use inside DataTableHead.
 */
export default function DataTableHeaderCell({
  children,
  align = 'left',
  sortKey,
  sortState,
  onSort,
  className,
  checkbox,
  checked = false,
  indeterminate = false,
  onCheckboxChange,
}: DataTableHeaderCellProps): React.JSX.Element {
  const isSortable = !!sortKey && !!onSort;

  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-spacing-4 uppercase',
        align === 'right' && 'flex-row-reverse',
        align === 'center' && 'justify-center'
      )}
    >
      {children}
      {isSortable && sortKey && getSortIcon(sortKey, sortState)}
    </span>
  );

  const label = isSortable ? (
    <button
      type="button"
      className="inline-flex items-center gap-spacing-4 bg-transparent border-none p-0 cursor-pointer text-inherit font-inherit hover:text-blackinverse-a100"
      onClick={() => {
        if (!sortKey || !onSort) return;
        const nextDir: SortDirection =
          sortState?.key === sortKey && sortState.direction === 'asc'
            ? 'desc'
            : 'asc';
        onSort(sortKey, nextDir);
      }}
      aria-label={
        typeof children === 'string' ? `Sort by ${children}` : sortKey
      }
    >
      {inner}
    </button>
  ) : (
    inner
  );

  return (
    <th
      className={cn(
        'text-[8px] leading-12 font-semibold text-blackinverse-a32 tracking-tight-1 whitespace-nowrap',
        checkbox
          ? 'py-spacing-8 pr-spacing-4 pl-spacing-8'
          : 'py-spacing-10 px-spacing-4',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {checkbox ? (
        <div className="flex items-center gap-spacing-8">
          <Checkbox
            size="sm"
            variant="accent"
            checked={checked}
            indeterminate={indeterminate}
            onChange={onCheckboxChange ?? noop}
            aria-label="Select all"
          />
          {label}
        </div>
      ) : (
        label
      )}
    </th>
  );
}

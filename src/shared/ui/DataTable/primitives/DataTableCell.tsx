import { cn } from '@/shared/utils/cn';
import React from 'react';
import type { ReactNode } from 'react';
import type { ColAlign } from '../DataTable';

interface DataTableCellProps {
  children?: ReactNode;
  align?: ColAlign;
  colSpan?: number;
  className?: string;
}

/**
 * DataTableCell — base <td> primitive with alignment and padding tokens.
 *
 * Use inside DataTableRow.
 */
export default function DataTableCell({
  children,
  align = 'left',
  colSpan,
  className,
}: DataTableCellProps): React.JSX.Element {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        'py-spacing-8 px-spacing-4 whitespace-nowrap',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  );
}

import React from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
interface DataTableHeadProps {
  children: ReactNode;
  className?: string;
  /** Extra classes applied to the inner <tr> (overrides default bg/border). */
  rowClassName?: string;
}

/**
 * DataTableHead — sticky <thead> container matching Figma tableHead component.
 *
 * Figma node: 63081:854 (tableHead)
 *
 * Renders a sticky header row with bottom border and surface background.
 * Place DataTableHeaderCell elements as children.
 */
export default function DataTableHead({
  children,
  className,
  rowClassName,
}: DataTableHeadProps): React.JSX.Element {
  return (
    <thead className={cn('sticky top-0 z-10', className)}>
      <tr
        className={cn(
          'bg-surfacelow-surfacelow1 border-b border-blackinverse-a8',
          rowClassName
        )}
      >
        {children}
      </tr>
    </thead>
  );
}

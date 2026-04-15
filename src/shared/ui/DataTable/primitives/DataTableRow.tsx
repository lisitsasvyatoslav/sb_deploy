import { cn } from '@/shared/utils/cn';
import React from 'react';
import type { ReactNode } from 'react';

/**
 * Maps to Figma tableRow states:
 * - 'default' → state=Default  (no background)
 * - 'active'  → state=Active   (bg: rgba(120,99,246,0.12) = brand-bg)
 */
export type DataTableRowState = 'default' | 'active';

interface DataTableRowProps {
  children: ReactNode;
  /**
   * Row state from Figma tableRow component set.
   * 'active' applies brand-bg (purple tint), 'default' is transparent.
   * Hover bg is handled automatically via CSS.
   */
  state?: DataTableRowState;
  /** @deprecated Use state="active" instead */
  selected?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
}

/**
 * DataTableRow — table row primitive matching Figma tableRow component.
 *
 * Figma node: 61075:46650 (tableRow component set)
 *
 * States:
 *   Default, hover=off  — transparent bg
 *   Default, hover=On   — bg: blackinverse-a2 (rgba 4,4,5 / 2%)
 *   Active,  hover=off  — bg: brand-bg        (rgba 120,99,246 / 12%)
 *   Active,  hover=On   — bg: brand-bg        (unchanged on hover)
 *
 * Border: 1px top, blackinverse-a4 (rgba 4,4,5 / 4%)
 *
 * Hover action pattern: pass a <td> with opacity-0 group-hover:opacity-100 as the last child.
 * Use `group` class (already applied) to trigger visibility from sibling tds.
 */
export default function DataTableRow({
  children,
  state,
  selected,
  onClick,
  className,
}: DataTableRowProps): React.JSX.Element {
  const isActive = state === 'active' || selected;

  return (
    <tr
      className={cn(
        'group border-t border-blackinverse-a4 first:border-t-0',
        onClick && 'cursor-pointer',
        isActive ? 'bg-brand-bg hover:bg-brand-bg' : 'hover:bg-blackinverse-a2',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

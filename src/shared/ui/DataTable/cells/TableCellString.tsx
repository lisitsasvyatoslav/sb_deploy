import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

interface TableCellStringProps {
  value: ReactNode;
  /** Optional counter badge, e.g. "+2". Figma: 9px / 500 / blackinverse-a12 bg / radius 8px */
  count?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * TableCellString — right-aligned text cell with optional counter badge
 *
 * Figma node: 61075:47855
 *
 * Layout: row justify-end gap=4px padding=8px 4px
 *   ├── label  (12px / 500 / blackinverse-a100, fill)
 *   └── counter badge  (9px / 500 / blackinverse-a12 bg / radius 8)
 */
const alignClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

const TableCellString: React.FC<TableCellStringProps> = ({
  value,
  count,
  align = 'right',
  className,
}) => (
  <div
    className={cn(
      'flex items-center gap-spacing-4 py-spacing-8 px-spacing-4',
      alignClass[align],
      className
    )}
  >
    <span
      className={cn(
        'text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100',
        align === 'right' && 'text-right'
      )}
    >
      {value}
    </span>
    {count != null && (
      <span className="inline-flex items-center justify-center bg-blackinverse-a12 backdrop-blur-[80px] rounded-lg px-[3px] text-[9px] leading-12 font-medium text-blackinverse-a100 shrink-0">
        {count}
      </span>
    )}
  </div>
);

export default TableCellString;

import { cn } from '@/shared/utils/cn';

interface TableCellNAProps {
  className?: string;
}

/**
 * TableCellNA — empty/not-applicable placeholder cell
 *
 * Figma node: 55815:5260
 *
 * Layout: row justify-end items-center padding=4px
 */
const TableCellNA: React.FC<TableCellNAProps> = ({ className }) => (
  <div className={cn('flex items-center justify-end p-spacing-4', className)}>
    <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100">
      N/A
    </span>
  </div>
);

export default TableCellNA;

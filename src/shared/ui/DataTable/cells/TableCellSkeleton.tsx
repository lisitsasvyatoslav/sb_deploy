import { cn } from '@/shared/utils/cn';

type SkeletonVariant = 'symbol' | 'string' | 'number';

interface TableCellSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const SkeletonRect: React.FC<{
  width: number;
  height: number;
  className?: string;
}> = ({ width, height, className }) => (
  <div
    className={cn(
      'rounded-[2px] bg-blackinverse-a12 animate-pulse shrink-0',
      className
    )}
    style={{ width, height }}
  />
);

const SkeletonCircle: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <div
    className={cn(
      'rounded-full bg-blackinverse-a12 animate-pulse shrink-0',
      className
    )}
    style={{ width: size, height: size }}
  />
);

/**
 * TableCellSkeleton — skeleton placeholder for loading state
 *
 * Figma node (symbol variant): 61027:40888
 *
 * Symbol variant layout: row gap=6px padding=4px 24px 4px 4px
 *   ├── circle  24×24px
 *   └── rect    flex-1 × 12px radius=1px
 */
const TableCellSkeleton: React.FC<TableCellSkeletonProps> = ({
  variant = 'string',
  className,
}) => {
  if (variant === 'symbol') {
    return (
      <div
        className={cn(
          'flex items-center gap-spacing-6 pt-spacing-4 pb-spacing-4 pl-spacing-4 pr-spacing-24',
          className
        )}
      >
        <SkeletonCircle size={24} />
        <div
          className="flex-1 bg-blackinverse-a12 animate-pulse rounded-[1px]"
          style={{ height: 12 }}
        />
      </div>
    );
  }

  if (variant === 'number') {
    return (
      <div className={cn('flex items-center justify-end', className)}>
        <SkeletonRect width={60} height={12} />
      </div>
    );
  }

  // string — Figma node: 61082:3057
  // row justify-end, padding=10px 24px 10px 4px, rect 32×12px radius=1px
  return (
    <div
      className={cn(
        'flex items-center justify-end pt-spacing-10 pb-spacing-10 pl-spacing-4 pr-spacing-24',
        className
      )}
    >
      <SkeletonRect width={32} height={12} />
    </div>
  );
};

export { SkeletonRect, SkeletonCircle };
export default TableCellSkeleton;

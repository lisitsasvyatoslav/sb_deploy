import React, { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getTradingIdeaColumns } from '@/features/board/utils/tradingIdeaHelpers';

const SKELETON_ROWS = 8;

const SkeletonRect: React.FC<{
  width?: number;
  height?: number;
  className?: string;
}> = ({ width = 32, height = 12, className }) => (
  <div
    className={`rounded-[2px] bg-whiteinverse-a8 animate-pulse shrink-0 ${className || ''}`}
    style={{ width, height }}
  />
);

const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    className="rounded-full bg-whiteinverse-a8 animate-pulse shrink-0"
    style={{ width: size, height: size }}
  />
);

const SkeletonTableRow: React.FC = () => (
  <tr className="border-b border-whiteinverse-a4">
    <td className="py-3 pl-4 pr-2">
      <div className="flex items-center gap-2">
        <SkeletonCircle size={28} />
        <SkeletonRect width={48} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={56} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={56} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={56} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={32} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={40} height={13} />
      </div>
    </td>
    <td className="py-3 px-2 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={32} height={13} />
      </div>
    </td>
    <td className="py-3 pl-2 pr-4 text-right">
      <div className="flex justify-end">
        <SkeletonRect width={64} height={24} className="rounded" />
      </div>
    </td>
  </tr>
);

export const LoadingSkeleton: React.FC = () => {
  const { t } = useTranslation('board');
  const tradingIdeaColumns = useMemo(() => getTradingIdeaColumns(t), [t]);
  return (
    <table className="w-full border-collapse min-w-[640px]">
      <thead>
        <tr className="border-b border-whiteinverse-a8">
          {tradingIdeaColumns.map((col) => (
            <th
              key={col.key}
              className={`py-2.5 px-2 text-[10px] font-medium tracking-widest text-[var(--text-secondary)] uppercase whitespace-nowrap ${col.className}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  );
};

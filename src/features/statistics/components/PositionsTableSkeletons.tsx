'use client';

import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n/client';
import {
  getPositionsBlockColumns,
  type ColAlign,
} from '@/features/statistics/utils/positionsBlockColumns';

const SKELETON_ROWS = 9;

const thClass = (align: ColAlign) =>
  classNames(
    'py-3 px-4 text-[8px] leading-[12px] font-semibold text-blackinverse-a32 uppercase tracking-[-0.2px] whitespace-nowrap',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    }
  );

// Skeleton pulse element — rounded rect
const SkeletonRect: React.FC<{
  width?: number;
  height?: number;
  className?: string;
}> = ({ width = 32, height = 12, className }) => (
  <div
    className={classNames(
      'rounded-[2px] bg-blackinverse-a12 animate-pulse shrink-0',
      className
    )}
    style={{ width, height }}
  />
);

// Skeleton pulse element — circle
const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className,
}) => (
  <div
    className={classNames(
      'rounded-full bg-blackinverse-a12 animate-pulse shrink-0',
      className
    )}
    style={{ width: size, height: size }}
  />
);

const SkeletonRow: React.FC = () => (
  <tr className="border-b theme-border">
    {/* Instrument — circle + rect */}
    <td className="py-3 px-4">
      <div className="flex items-center gap-[6px]">
        {/* chevron placeholder */}
        <div className="w-[12px] h-5 shrink-0" />
        <SkeletonCircle size={24} />
        <SkeletonRect width={48} height={12} />
      </div>
    </td>

    {/* Broker */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={32} height={12} />
      </div>
    </td>

    {/* Account */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={40} height={12} />
      </div>
    </td>

    {/* Exchange */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={28} height={12} />
      </div>
    </td>

    {/* Quantity */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={32} height={12} />
      </div>
    </td>

    {/* Avg Open Price */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={40} height={12} />
      </div>
    </td>

    {/* Current Price */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={40} height={12} />
      </div>
    </td>

    {/* Unrealized PnL % */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={32} height={12} />
      </div>
    </td>

    {/* Unrealized PnL Money */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={48} height={12} />
      </div>
    </td>

    {/* Realized PnL */}
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end">
        <SkeletonRect width={48} height={12} />
      </div>
    </td>

    {/* Action */}
    <td className="py-3 px-4 w-12">
      <SkeletonRect width={24} height={24} className="rounded-[2px] ml-auto" />
    </td>
  </tr>
);

const PositionsTableSkeletons: React.FC = () => {
  const { t } = useTranslation('statistics');
  const COLUMNS = useMemo(() => getPositionsBlockColumns(t), [t]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-surfacelow-surfacelow1 border-b border-blackinverse-a12">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={
                    col.key === 'action' ? 'py-3 px-4 w-12' : thClass(col.align)
                  }
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>

        {/* Bottom gradient fade — matches Figma mask */}
        {/* <div
          className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
          style={{background: 'linear-gradient(to bottom, transparent 0%, var(--bg-page, #fff) 100%)',}}
        /> */}
      </div>
    </div>
  );
};

export default PositionsTableSkeletons;

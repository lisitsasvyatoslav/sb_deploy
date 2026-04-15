'use client';

import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

const ProfitabilityChartSkeleton: React.FC = () => {
  const { t } = useTranslation('statistics');

  return (
    <div className="bg-surfacelow-surfacelow1 rounded-2xl w-full h-[340px] flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-2 py-2">
        {/* Period Dropdown Ghost */}
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl min-w-[112px]">
          <span className="text-blackinverse-a32 text-xs font-medium tracking-[-0.2px] leading-4 whitespace-nowrap">
            {t('dateRange.allTime')}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M3 6L8 11L13 6"
              className="stroke-[var(--blackinverse-a8)]"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Broker Filters Skeleton */}
        <div className="flex items-center mr-4">
          <div className="h-2 w-[120px] bg-gradient-to-r from-transparent via-skeleton-shimmer to-transparent rounded" />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="flex-1 pl-6 pr-5 pb-3.5 pt-2.5 flex gap-1">
        {/* Graph Line Skeleton */}
        <div className="flex-1 flex items-center justify-center py-2.5">
          <svg
            width="100%"
            height="140"
            viewBox="0 0 600 140"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120 L50 110 L100 100 L150 90 L200 70 L250 50 L300 40 L350 60 L400 80 L450 70 L500 90 L550 100 L600 110"
              className="stroke-[var(--blackinverse-a12)]"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Y-axis Values Skeleton */}
        <div className="flex flex-col justify-between h-full py-2.5">
          <div className="h-[18px] flex items-center justify-end">
            <div className="h-2 w-16 bg-gradient-to-r from-transparent via-skeleton-shimmer to-transparent rounded" />
          </div>
          <div className="h-[18px] flex items-center justify-end">
            <div className="h-2 w-16 bg-gradient-to-r from-transparent via-skeleton-shimmer to-transparent rounded" />
          </div>
          <div className="h-[18px] flex items-center justify-end">
            <div className="h-2 w-16 bg-gradient-to-r from-transparent via-skeleton-shimmer to-transparent rounded" />
          </div>
          <div className="h-[18px] flex items-center justify-end">
            <div className="h-2 w-16 bg-gradient-to-r from-transparent via-skeleton-shimmer to-transparent rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityChartSkeleton;

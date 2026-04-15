'use client';

import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import {
  getPositionsBlockColumns,
  type ColAlign,
} from '@/features/statistics/utils/positionsBlockColumns';
import { useSyncProgressQuery } from '../queries';
import DotsLoader from './DotsLoader';

const thClass = (align: ColAlign) =>
  classNames(
    'py-3 px-4 text-[8px] leading-[12px] font-semibold text-blackinverse-a32 uppercase tracking-[-0.2px] whitespace-nowrap',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    }
  );

/**
 * PortfolioFirstLoadState — loading state shown while broker data syncs for the first time.
 *
 * Figma node: 4460:44752 (Property 1=Loading first data)
 *
 * Shows:
 * - Table header row (same columns as real table)
 * - Centred text block: title + description
 * - DotsLoader: determinate when backend reports progress, indeterminate otherwise
 * - Accounts counter when total > 0
 * - Bottom gradient fade mask
 */
const PortfolioFirstLoadState: React.FC = () => {
  const { t } = useTranslation('statistics');
  const COLUMNS = useMemo(() => getPositionsBlockColumns(t), [t]);

  const isDataSyncInProgress = useStatisticsStore(
    (state) => state.isDataSyncInProgress
  );

  const { data: syncProgress } = useSyncProgressQuery(isDataSyncInProgress);

  const progress = useMemo(() => {
    if (!syncProgress || syncProgress.total === 0) return undefined;
    return Math.round((syncProgress.completed / syncProgress.total) * 100);
  }, [syncProgress]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Table header — same as real table */}
      <table className="w-full flex-shrink-0">
        <thead>
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
      </table>

      {/* Loading content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
        {/* Text block */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[14px] leading-[20px] font-semibold tracking-[-0.2px] text-blackinverse-a100">
            {t('positions.firstLoadTitle')}
          </p>
          <p className="text-[12px] leading-[16px] font-normal tracking-[-0.2px] text-blackinverse-a56 max-w-[360px]">
            {t('positions.firstLoadDescription')}
          </p>
        </div>

        {/* Progress bar + counter */}
        <div className="flex flex-col items-center gap-2 w-[480px] max-w-full px-4">
          <DotsLoader progress={progress} />

          {syncProgress && syncProgress.total > 0 && (
            <p className="text-[11px] leading-[16px] text-blackinverse-a32 tabular-nums">
              {syncProgress.completed} / {syncProgress.total}
            </p>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--surfacelow-surfacelow1) 100%)',
        }}
      />
    </div>
  );
};

export default PortfolioFirstLoadState;

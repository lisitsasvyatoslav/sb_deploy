'use client';

import React, { useMemo } from 'react';
import classNames from 'classnames';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import {
  getPositionsBlockColumns,
  type ColAlign,
} from '@/features/statistics/utils/positionsBlockColumns';

const thClass = (align: ColAlign) =>
  classNames(
    'py-3 px-4 text-[8px] leading-[12px] font-semibold text-blackinverse-a32 uppercase tracking-[-0.2px] whitespace-nowrap',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    }
  );

interface PositionsTableEmptyStateProps {
  onConnectBroker?: () => void;
  onImportCsv?: () => void;
}

const PositionsTableEmptyState: React.FC<PositionsTableEmptyStateProps> = ({
  onConnectBroker,
  onImportCsv,
}) => {
  const { t } = useTranslation('statistics');
  const COLUMNS = useMemo(() => getPositionsBlockColumns(t), [t]);

  return (
    <div className="h-full flex flex-col">
      {/* Table header — same as the real table */}
      <table className="w-full">
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

      {/* Empty state content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-[47px] /* 47px from Figma */">
        {/* Text block */}
        <div className="flex flex-col items-center gap-2 /* 8px gap from Figma */">
          <p className="text-[14px] leading-[20px] font-semibold tracking-[-0.2px] text-blackinverse-a100 text-center">
            {t('positions.noDataTitle')}
          </p>
          <p className="text-[12px] leading-[16px] font-normal tracking-[-0.2px] text-blackinverse-a56 text-center">
            {t('positions.noDataDescription')}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={onConnectBroker}
            data-testid="connect-broker-button"
          >
            {t('positions.connectBrokers')}
          </Button>
          {onImportCsv && (
            <Button size="sm" variant="secondary" onClick={onImportCsv}>
              {t('positions.importFromCsv')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionsTableEmptyState;

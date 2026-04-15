'use client';

import React, { FC } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { HeartPlus } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';

interface StrategyDetailHeaderProps {
  title: string;
  createdAt?: string;
  onClose?: () => void;
}

const StrategyDetailHeader: FC<StrategyDetailHeaderProps> = ({
  title,
  createdAt,
  onClose,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3.5 pb-3 pt-2 flex-wrap">
        <div className="flex-1 flex items-center gap-1 h-6 min-w-0">
          <span className="inline-flex items-center shrink-0 px-2 py-0.5 rounded text-sm font-medium text-brand-text___icon bg-brand-base">
            {t('strategiesCatalog.detail.strategyBadge')}
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-blackinverse-a56 tracking-[-0.2px]">
            {createdAt ?? ''}
          </span>
          <div className="flex items-center gap-2">
            <IconButton
              icon={<Icon variant="addBoard" size={16} />}
              size={16}
              ariaLabel={t('strategiesCatalog.detail.addToBoard')}
            />
            <IconButton
              icon={<HeartPlus className="w-4 h-4" />}
              size={16}
              ariaLabel={t('strategiesCatalog.detail.addToFavorites')}
            />
            <IconButton
              icon={<Icon variant="close" size={16} />}
              size={16}
              ariaLabel={t('strategiesCatalog.detail.close')}
              onClick={onClose}
            />
          </div>
        </div>
      </div>
      <h2 className="text-blackinverse-a100 text-sm leading-5 font-bold">
        {title}
      </h2>
    </div>
  );
};

export default StrategyDetailHeader;

'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { TradingStrategyDto } from '@/types/StrategiesCatalog';
import StrategyDetailKeyMetrics from './StrategyDetailKeyMetrics';
import StrategyDetailInfo from './StrategyDetailInfo';
import StrategyDetailComposition from './StrategyDetailComposition';
import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';

interface StrategyDetailSidebarProps {
  strategyData?: TradingStrategyDto;
  onConnectClick: () => void;
  className?: string;
}

const StrategyDetailSidebar: React.FC<StrategyDetailSidebarProps> = ({
  strategyData,
  onConnectClick,
  className,
}) => {
  const { t, i18n } = useTranslation('common');
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div
      className={cn(
        'min-w-[300px] flex-1 border-t border-border-light pt-spacing-20 [@container(min-width:724px)]:border-t-0 [@container(min-width:724px)]:pt-0 [@container(min-width:724px)]:flex-none [@container(min-width:724px)]:w-[248px]',
        className
      )}
    >
      <div className="bg-background-card rounded flex flex-col gap-5 pt-2 pb-4">
        {/* Key Metrics */}
        <div className="px-4 pt-2">
          <StrategyDetailKeyMetrics
            profitability={strategyData?.stats?.data?.annualAverageProfit}
            riskLevel={strategyData?.riskLevel}
            minSum={strategyData?.minSum}
            maxDrawDown={strategyData?.maxDrawDown}
          />
        </div>

        {/* Connect button */}
        <div className="px-4">
          <Button
            variant="accent"
            size="md"
            className="w-full"
            onClick={onConnectClick}
          >
            {t('strategiesCatalog.detail.connect')}
          </Button>
        </div>

        <div className="border-t border-border-card" />

        {/* Author + Subscribers */}
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-14 leading-20 tracking-tight-1 text-blackinverse-a32">
              {t('strategiesCatalog.detail.author')}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-12 leading-20 text-text-primary">
                {strategyData?.author ?? '—'}
              </span>
              {strategyData?.authorAvatarUrl && !avatarError ? (
                <img
                  src={strategyData.authorAvatarUrl}
                  alt={strategyData.author ?? ''}
                  className="w-5 h-5 rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blackinverse-a8 flex items-center justify-center">
                  <Icon variant="userRound" size={12} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-14 leading-20 tracking-tight-1 text-blackinverse-a32">
              {t('strategiesCatalog.detail.subscribers')}
            </span>
            <span className="text-14 leading-20 tracking-tight-1 text-text-primary">
              {strategyData?.followersCount != null
                ? Number(strategyData.followersCount).toLocaleString(
                    i18n.language === 'ru' ? 'ru-RU' : 'en-US'
                  )
                : '—'}
            </span>
          </div>
        </div>

        <div className="border-t border-border-card" />

        {/* Info */}
        <div className="px-4">
          <StrategyDetailInfo
            moneyLimit={strategyData?.moneyLimit}
            tradeActivityIndex={strategyData?.tradeActivityIndex}
          />
        </div>

        <div className="border-t border-border-card" />

        {/* Composition */}
        <div className="px-4">
          <StrategyDetailComposition />
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailSidebar;

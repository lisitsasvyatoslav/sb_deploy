'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/client';
import type { TradingStrategyDto } from '@/types/StrategiesCatalog';
import { getStrategyCardRiskLabel } from '@/features/strategies-catalog/utils/strategyCardRiskLabel';
import { getStrategyCardRiskTextClass } from '@/features/strategies-catalog/utils/strategyCardRiskStyles';
import {
  formatSignedProfitPercent,
  getProfitPercentColorClass,
} from '@/features/strategies-catalog/utils/strategyProfitPercentDisplay';
import { cn } from '@/shared/utils/cn';

export type StrategySummaryStrategy = Pick<
  TradingStrategyDto,
  'title' | 'author' | 'authorAvatarUrl' | 'riskLevel' | 'stats'
>;

type Density = 'compact' | 'comfortable';

const DENSITY_CLASSES: Record<
  Density,
  {
    title: string;
    profit: string;
    riskRow: string;
    avatar: string;
    initials: string;
  }
> = {
  compact: {
    title: 'text-sm font-semibold text-text-primary leading-tight line-clamp-1',
    profit: 'text-base font-bold leading-tight shrink-0',
    riskRow: 'flex items-center gap-1 text-[11px] font-medium',
    avatar:
      'w-5 h-5 rounded-full bg-background-muted flex items-center justify-center overflow-hidden shrink-0',
    initials: 'text-[8px] font-medium text-text-muted',
  },
  comfortable: {
    title:
      'text-base font-semibold text-text-primary leading-tight line-clamp-1',
    profit: 'text-lg font-bold leading-tight shrink-0',
    riskRow: 'flex items-center gap-1 text-xs font-medium',
    avatar:
      'w-6 h-6 rounded-full bg-background-muted flex items-center justify-center overflow-hidden shrink-0',
    initials: 'text-[9px] font-medium text-text-muted',
  },
};

export type StrategySummaryCardProps = {
  strategy: StrategySummaryStrategy;
  density?: Density;
  footerTrailing?: React.ReactNode;
  className?: string;
  as?: 'div' | 'button';
} & Omit<React.HTMLAttributes<HTMLElement>, 'children'>;

export const StrategySummaryCard = React.forwardRef<
  HTMLDivElement | HTMLButtonElement,
  StrategySummaryCardProps
>(function StrategySummaryCard(
  {
    as: Comp = 'div',
    strategy,
    density = 'comfortable',
    footerTrailing,
    className,
    ...rest
  },
  ref
) {
  const { t } = useTranslation('common');
  const profit = strategy.stats?.data?.annualAverageProfit;
  const riskLevel = strategy.riskLevel;
  const riskLabel = getStrategyCardRiskLabel(riskLevel, t);
  const riskClass = getStrategyCardRiskTextClass(riskLevel);
  const initials = (strategy.author ?? '').slice(0, 2).toUpperCase();
  const d = DENSITY_CLASSES[density];

  const rootClass = cn(
    'flex flex-col bg-background-card border border-border-light rounded-lg overflow-hidden',
    Comp === 'button' &&
      'w-full text-left transition-all duration-200 p-0 m-0 font-inherit cursor-pointer',
    className
  );

  const inner = (
    <>
      <div className="px-4 pt-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className={d.title} title={strategy.title}>
            {strategy.title}
          </span>
          {profit !== undefined && (
            <span className={cn(d.profit, getProfitPercentColorClass(profit))}>
              {formatSignedProfitPercent(profit, { decimals: 1 })}
            </span>
          )}
        </div>
        {riskLevel && riskLabel && riskClass && (
          <div className={cn(d.riskRow, riskClass)}>
            <Zap className="w-3 h-3 shrink-0" />
            {riskLabel}
          </div>
        )}
      </div>
      <div
        className={cn(
          'px-4 pb-3 pt-2 flex items-center',
          footerTrailing ? 'justify-between' : 'gap-2'
        )}
      >
        <div className="flex items-center gap-2">
          <div className={d.avatar}>
            {strategy.authorAvatarUrl ? (
              <img
                src={strategy.authorAvatarUrl}
                alt={strategy.author ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className={d.initials}>{initials}</span>
            )}
          </div>
          <span className="text-xs text-text-secondary">{strategy.author}</span>
        </div>
        {footerTrailing}
      </div>
    </>
  );

  if (Comp === 'button') {
    const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={rootClass}
        {...buttonRest}
        type={buttonRest.type ?? 'button'}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={rootClass}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      {inner}
    </div>
  );
});

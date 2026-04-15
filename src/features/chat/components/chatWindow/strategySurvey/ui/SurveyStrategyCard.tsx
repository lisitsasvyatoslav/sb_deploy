import React, { useMemo, useState } from 'react';
import { HeartPlus, Zap } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MockStrategyWithMatch } from '../survey.mock-strategies';
import { useGetProfitPoints } from '@/features/strategies-catalog/queries';
import { getStrategyCardRiskLabel } from '@/features/strategies-catalog/utils/strategyCardRiskLabel';
import { getSurveyStrategyCardRiskTextClass } from '@/features/strategies-catalog/utils/strategyCardRiskStyles';
import {
  formatSignedProfitPercent,
  getProfitPercentColorClass,
} from '@/features/strategies-catalog/utils/strategyProfitPercentDisplay';
import { useTranslation } from '@/shared/i18n/client';
import { cn } from '@/shared/utils/cn';
import { Link } from '@/shared/ui/Navigation';

const CHART_PURPLE = 'var(--mind-accent)';

interface SurveyStrategyCardProps {
  strategy: MockStrategyWithMatch;
  className?: string;
}

const SurveyStrategyCard: React.FC<SurveyStrategyCardProps> = ({
  strategy,
  className,
}) => {
  const { t } = useTranslation('common');
  const [imgError, setImgError] = useState(false);
  const profit = strategy.stats?.data?.annualAverageProfit;
  const riskLevel = strategy.riskLevel;
  const riskLabel = getStrategyCardRiskLabel(riskLevel, t);
  const riskClass = getSurveyStrategyCardRiskTextClass(riskLevel);
  const initials = (strategy.author ?? '').slice(0, 2).toUpperCase();

  const { data: profitPoints } = useGetProfitPoints(strategy.id);
  const chartData = useMemo(
    () =>
      (profitPoints ?? [])
        .map((p, i) => ({ index: i, value: p.value }))
        .reverse(),
    [profitPoints]
  );

  return (
    <Link
      to={`/strategies-catalog/${strategy.id}`}
      className={cn(
        'w-full flex flex-col bg-background-card border-border-light',
        className
      )}
    >
      {/* Title + Risk (with padding) */}
      <div className="px-4 pt-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-5">
          <span
            className="text-base font-semibold text-text-primary leading-tight line-clamp-1"
            title={strategy.title}
          >
            {strategy.title}
          </span>
          {profit !== undefined && (
            <span
              className={cn(
                'text-[22px] font-bold leading-tight shrink-0',
                getProfitPercentColorClass(profit)
              )}
            >
              {formatSignedProfitPercent(profit, {
                decimals: 1,
                decimalSeparator: ',',
                compactWholeNumbers: true,
              })}
            </span>
          )}
        </div>

        {riskLevel && riskLabel && riskClass && (
          <div
            className={cn(
              'flex items-center gap-1 text-[12px] font-medium',
              riskClass
            )}
          >
            <Zap className="w-3 h-3 shrink-0" />
            {riskLabel}
          </div>
        )}
      </div>

      {/* Chart (full-bleed, no horizontal padding) */}
      <div className="w-full h-[60px] mt-2 overflow-hidden">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient
                  id={`surveyChartGradient-${strategy.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CHART_PURPLE}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_PURPLE}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="index"
                hide
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_PURPLE}
                strokeWidth={1.5}
                fill={`url(#surveyChartGradient-${strategy.id})`}
                isAnimationActive={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-background-muted/50" />
        )}
      </div>

      {/* Avatar + Heart (with padding) */}
      <div className="px-4 pb-3 pt-2 flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center overflow-hidden shrink-0">
          {strategy.authorAvatarUrl && !imgError ? (
            <img
              src={strategy.authorAvatarUrl}
              alt={strategy.author ?? ''}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            // <span className="text-xs font-medium text-text-muted rounded-full bg-background-muted p-1">
            //   {initials}
            // </span>
            <div
              className="shrink-0 rounded-full flex items-center justify-center overflow-hidden w-5 h-5 border border-black/5"
              style={{
                background: `linear-gradient(to bottom right, var(--color-accent), var(--brand-primary-hover))`,
              }}
            >
              <span className="text-white text-[10px] font-medium">
                {initials}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="text-text-muted hover:text-status-negative transition shrink-0 p-1 -m-1"
          onClick={(e) => e.preventDefault()}
        >
          <HeartPlus className="w-5 h-5" />
        </button>
      </div>
    </Link>
  );
};

export default SurveyStrategyCard;

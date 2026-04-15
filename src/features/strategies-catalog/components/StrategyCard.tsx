'use client';
import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Shield, Users, Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { RiskLevel } from '@/types/StrategiesCatalog';
import { getStrategyCardRiskLabel } from '@/features/strategies-catalog/utils/strategyCardRiskLabel';
import {
  formatSignedProfitPercent,
  getProfitPercentColorClass,
} from '@/features/strategies-catalog/utils/strategyProfitPercentDisplay';
import { ConnectStrategyModal } from './ConnectStrategyModal';
import { Link } from '@/shared/ui/Navigation';
import Button from '@/shared/ui/Button';
import { useGetProfitPoints, useGetStrategyCatalogById } from '../queries';
import { sanitizeHtml } from '@/shared/utils/sanitizeHtml';
import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { currentRegionConfig } from '@/shared/config/region';

interface StrategyCardProps {
  onDiscuss: () => void;
  strategyId: string;
}

export function StrategyCard({ onDiscuss, strategyId }: StrategyCardProps) {
  const { t, i18n } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: strategyData } = useGetStrategyCatalogById(strategyId);
  const { data: profitPointsData } = useGetProfitPoints(strategyId);

  const numberLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  const handleModalOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleDiscuss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDiscuss();
  };

  const getRiskLevelClassName = (riskLevel: RiskLevel) => {
    return riskLevel === 'conservative'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      : riskLevel === 'moderate'
        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
        : 'bg-red-500/10 border-red-500/20 text-red-500';
  };

  return (
    <>
      <Link
        to={`/strategies-catalog/${strategyId}`}
        className={
          'w-full bg-background-card border border-border-light rounded-[4px] overflow-hidden transition-all duration-300 hover:border-border-medium group relative block'
        }
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              {strategyData?.autoFollowingTariffName && (
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {strategyData?.title}
                </h3>
              )}
              {strategyData?.author && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center overflow-hidden">
                    {strategyData.authorAvatarUrl ? (
                      <img
                        src={strategyData.authorAvatarUrl}
                        alt={strategyData.author}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-text-muted">
                        {strategyData.author.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {t('strategiesCatalog.card.author')}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {strategyData.author}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* ROI Block */}
            {strategyData?.stats?.data?.annualAverageProfit != null && (
              <div className="text-right">
                <div
                  className={cn(
                    'text-3xl font-bold',
                    getProfitPercentColorClass(
                      strategyData.stats.data.annualAverageProfit
                    )
                  )}
                >
                  {formatSignedProfitPercent(
                    strategyData.stats.data.annualAverageProfit,
                    { decimals: 2 }
                  )}
                </div>
                <div className="text-xs text-text-muted font-medium uppercase tracking-wide">
                  {t('strategiesCatalog.card.yield')}
                </div>
              </div>
            )}
          </div>

          {/* Info Badges Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {strategyData?.riskLevel && (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border text-xs font-medium',
                  getRiskLevelClassName(strategyData?.riskLevel)
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                {t('strategiesCatalog.card.risk')}:&nbsp;
                {getStrategyCardRiskLabel(strategyData?.riskLevel, t)}
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-background-secondary border border-border-light text-xs font-medium text-[var(--color-accent)]">
              <GraduationCap className="w-3.5 h-3.5" />
              {t('strategiesCatalog.card.draft')}
            </div>
          </div>

          {/* Chart */}
          <div className="w-full h-[180px] bg-background-base rounded-[4px] border border-border-light p-4 mb-4 relative group-hover:border-border-medium transition-colors">
            <div className="absolute top-3 left-4 text-xs font-medium text-text-muted z-10">
              {t('strategiesCatalog.card.chart')}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitPointsData}>
                <defs>
                  <linearGradient
                    id={`colorValue-${strategyId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      style={{ stopColor: 'var(--color-accent)' }}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      style={{ stopColor: 'var(--color-accent)' }}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#52525B',
                    fontSize: 10,
                  }}
                  hide
                />

                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#colorValue-${strategyId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Description */}
          {strategyData?.description && (
            <div
              className="text-sm text-text-secondary mb-6 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(strategyData?.description),
              }}
              title={strategyData?.description}
            ></div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border-light">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <Users className="w-4 h-4" />
                {strategyData?.followersCount && (
                  <span className="text-sm">
                    {t('strategiesCatalog.card.subscribers', {
                      count: Number(strategyData.followersCount),
                    })}
                  </span>
                )}
              </div>
              {strategyData?.minSum && (
                <div className="text-sm text-text-secondary">
                  {t('strategiesCatalog.card.minAmount')}
                  <span className="text-text-primary font-medium ml-1">
                    {strategyData.minSum.toLocaleString(numberLocale)}{' '}
                    {getCurrencySymbol(currentRegionConfig.baseCurrency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleModalOpen}
              className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--brand-primary-hover)] text-white font-medium py-2.5 rounded-[4px] transition-colors text-sm shadow-lg shadow-[var(--brand-primary-light)]"
            >
              {t('strategiesCatalog.card.connectStrategy')}
            </Button>
            <button
              onClick={handleDiscuss}
              className="flex items-center gap-2 px-4 py-2.5 bg-background-secondary hover:bg-background-hover border border-border-light rounded-[4px] text-text-secondary hover:text-[var(--color-accent)] transition-colors text-sm"
              title={t('strategiesCatalog.card.discussWithAi')}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden xl:inline">
                {t('strategiesCatalog.card.discussWithAi')}
              </span>
            </button>
          </div>
        </div>
      </Link>
      <ConnectStrategyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

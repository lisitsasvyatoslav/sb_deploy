import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { deploymentApi } from '@/services/api/deployments';
import {
  useDeploymentsQuery,
  useDeploymentIdeasQuery,
} from '@/features/strategy/queries';
import {
  formatPrice,
  getTradingIdeaColumns,
} from '@/features/board/utils/tradingIdeaHelpers';
import { useDeploymentNavStore } from '@/stores/deploymentNavStore';
import { RelevanceTimer } from './RelevanceTimer';
import { LoadingSkeleton } from './TradingIdeaSkeleton';
import type { TradingIdea } from '@/types';
import { showErrorToast } from '@/shared/utils/toast';

const IdeaRow: React.FC<{ idea: TradingIdea }> = ({ idea }) => {
  const { t, i18n } = useTranslation('board');
  const locale = getLocaleTag(i18n.language);
  const currencySymbol = getCurrencySymbol(idea.currency ?? undefined);
  const confidencePct =
    idea.confidence != null ? Math.round(idea.confidence * 100) : null;
  const confidenceColor =
    confidencePct != null
      ? confidencePct >= 70
        ? 'text-green-400'
        : confidencePct >= 40
          ? 'text-yellow-400'
          : 'text-red-400'
      : '';

  return (
    <tr className="border-b border-whiteinverse-a4 last:border-b-0 hover:bg-whiteinverse-a2 transition-colors">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <TickerIcon
            symbol={idea.ticker}
            securityId={idea.securityId}
            size={28}
          />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-wide">
            {idea.ticker}
          </span>
          <span
            className={`text-[12px] font-medium ${
              idea.direction === 'long' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {idea.direction === 'long' ? '▲' : '▼'}
          </span>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {formatPrice(idea.entryPrice, locale)}&nbsp;{currencySymbol}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] text-[var(--text-primary)]">
          {idea.takeProfit != null
            ? `${formatPrice(idea.takeProfit, locale)} ${currencySymbol}`
            : '—'}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] text-[var(--text-primary)]">
          {idea.stopLoss != null
            ? `${formatPrice(idea.stopLoss, locale)} ${currencySymbol}`
            : '—'}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] text-[var(--text-primary)]">
          {idea.lots}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] text-[var(--text-primary)]">
          {idea.riskRewardRatio != null
            ? `1:${idea.riskRewardRatio.toFixed(1)}`
            : '—'}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        {confidencePct != null ? (
          <span className={`text-[13px] font-medium ${confidenceColor}`}>
            {confidencePct}%
          </span>
        ) : (
          <span className="text-[13px] text-[var(--text-secondary)]">—</span>
        )}
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <Button
          variant="secondary"
          size="xs"
          onClick={(e) => e.stopPropagation()}
        >
          {idea.direction === 'long'
            ? t('tradingIdea.buy')
            : t('tradingIdea.sell')}
        </Button>
      </td>
    </tr>
  );
};

interface TradingIdeaContentProps {
  strategyId?: number;
}

export const TradingIdeaContent: React.FC<TradingIdeaContentProps> = ({
  strategyId,
}) => {
  const { t, i18n } = useTranslation('board');
  const tradingIdeaColumns = useMemo(() => getTradingIdeaColumns(t), [t]);
  const { data: deployments = [], isLoading: deploymentsLoading } =
    useDeploymentsQuery(strategyId);

  const currentIndex = useDeploymentNavStore((s) =>
    strategyId != null ? (s.indices[strategyId] ?? -1) : -1
  );
  const setIndex = useDeploymentNavStore((s) => s.setIndex);

  const [isExpired, setIsExpired] = useState(false);
  const isDeploying = useDeploymentNavStore((s) =>
    strategyId != null ? (s.deploying[strategyId] ?? false) : false
  );

  // Sync nav store when deployments change (always jump to latest)
  useEffect(() => {
    if (!strategyId) return;
    if (deployments.length > 0) {
      setIndex(strategyId, deployments.length - 1);
    } else {
      setIndex(strategyId, -1);
    }
  }, [strategyId, deployments, setIndex]);

  const currentDeployment = deployments[currentIndex];
  const currentDeploymentId = currentDeployment?.id;

  useEffect(() => {
    if (currentDeployment) {
      const expiresAt =
        new Date(currentDeployment.createdAt).getTime() +
        currentDeployment.ideasTtlSeconds * 1000;
      setIsExpired(Date.now() >= expiresAt);
    } else {
      setIsExpired(false);
    }
  }, [currentDeployment]);

  const { data: ideas = [], isLoading: ideasLoading } = useDeploymentIdeasQuery(
    strategyId,
    currentDeploymentId
  );

  const handleDownload = useCallback(async () => {
    if (!strategyId || !currentDeploymentId) return;
    try {
      const blob = await deploymentApi.downloadCSV(
        strategyId,
        currentDeploymentId
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-ideas-${currentDeploymentId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showErrorToast(t('tradingIdea.downloadError'));
    }
  }, [strategyId, currentDeploymentId, t]);

  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const isLoading = deploymentsLoading || ideasLoading;
  const showSkeleton = isLoading || (isDeploying && ideas.length === 0);
  const isEmpty = !isLoading && !isDeploying && deployments.length === 0;

  return (
    <div
      className={classNames(
        'flex flex-col h-full nowheel',
        isExpired && 'opacity-50'
      )}
      onMouseDown={stopPropagation}
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Table */}
      <div className="flex-1 overflow-auto">
        {showSkeleton ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-[13px] text-[var(--text-secondary)]">
            {t('tradingIdea.emptyState')}
          </div>
        ) : (
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
              {ideas.length === 0 ? (
                <tr>
                  <td
                    colSpan={tradingIdeaColumns.length}
                    className="py-8 text-center text-[13px] text-[var(--text-secondary)]"
                  >
                    {t('tradingIdea.emptyState')}
                  </td>
                </tr>
              ) : (
                ideas.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {currentDeployment && !showSkeleton && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-whiteinverse-a6">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            onClick={handleDownload}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="opacity-60"
            >
              <path
                d="M7 2v6m0 0L4.5 5.5M7 8l2.5-2.5M2.5 11h9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t('tradingIdea.download')}</span>
          </button>
          <RelevanceTimer
            createdAt={currentDeployment.createdAt}
            ttlSeconds={currentDeployment.ideasTtlSeconds}
            onExpire={() => setIsExpired(true)}
          />
        </div>
      )}
    </div>
  );
};

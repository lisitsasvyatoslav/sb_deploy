'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { StrategyDetailSchedule } from '@/features/strategies-catalog/components/StrategyDetailSchedule';
import { PeriodTab } from '@/features/strategies-catalog/mock/strategyDetail';
import StrategyDetailHeader from '@/features/strategies-catalog/components/StrategyDetailHeader';
import StrategyDetailAiAnalysis from '@/features/strategies-catalog/components/StrategyDetailAiAnalysis';
import StrategyDetailDescription from '@/features/strategies-catalog/components/StrategyDetailDescription';
import StrategyDetailConnectionConditions from '@/features/strategies-catalog/components/StrategyDetailConnectionConditions';
import StrategyDetailTariffs from '@/features/strategies-catalog/components/StrategyDetailTariffs';
import StrategyDetailSidebar from '@/features/strategies-catalog/components/StrategyDetailSidebar';
import { ConnectStrategyModal } from '@/features/strategies-catalog/components/ConnectStrategyModal';
import {
  useGetStrategyCatalogById,
  useGetProfitPoints,
  ProfitPointsFilter,
} from '@/features/strategies-catalog/queries';

/** Вычисляет From-дату для фильтрации profit-points по периоду */
const getProfitPointsFilter = (
  period: PeriodTab
): ProfitPointsFilter | undefined => {
  if (period === 'ALL') return undefined;

  const now = new Date();
  const from = new Date(now);

  switch (period) {
    case 'YEAR':
      from.setFullYear(from.getFullYear() - 1);
      break;
    case 'MONTH':
      from.setMonth(from.getMonth() - 1);
      break;
    case 'QUARTER':
      from.setMonth(from.getMonth() - 3);
      break;
    case 'WEEK':
      from.setDate(from.getDate() - 7);
      break;
    default:
      return undefined;
  }

  return {
    From: from.toISOString().split('T')[0],
    To: now.toISOString().split('T')[0],
  };
};

const formatDate = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

/** Маппинг выбранного периода на поле stats */
const getReturnByPeriod = (
  stats:
    | { profitLifetime?: number; profitYear?: number; profit30Days?: number }
    | undefined,
  period: PeriodTab
): number => {
  if (!stats) return 0;
  switch (period) {
    case 'ALL':
      return Number(stats.profitLifetime ?? 0);
    case 'YEAR':
      return Number(stats.profitYear ?? 0);
    case 'MONTH':
      return Number(stats.profit30Days ?? 0);
    default:
      return 0;
  }
};

const StrategiesCatalogDetailPage = ({ id }: { id: string }) => {
  useTranslation('common');
  const [activePeriod, setActivePeriod] = useState<PeriodTab>('ALL');
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const { data: strategyData } = useGetStrategyCatalogById(id);
  const profitFilter = useMemo(
    () => getProfitPointsFilter(activePeriod),
    [activePeriod]
  );
  const { data: profitPointsData, isFetching: isChartLoading } =
    useGetProfitPoints(id, profitFilter);

  const chartDates = useMemo(
    () => (profitPointsData?.map((p) => p.date) ?? []).reverse(),
    [profitPointsData]
  );

  const chartData = useMemo(
    () => (profitPointsData?.map((p) => p.value) ?? []).reverse(),
    [profitPointsData]
  );

  // TODO [MOCK] — portfolioData нет в API, генерируется на основе chartData
  const portfolioData = useMemo(
    () => chartData.map((v, i) => v * 0.65 + Math.sin(i) * 2),
    [chartData]
  );

  const currentReturn = getReturnByPeriod(
    strategyData?.stats?.data,
    activePeriod
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — full width above columns */}
      <div className="px-spacing-24">
        <StrategyDetailHeader
          title={strategyData?.title ?? ''}
          createdAt={formatDate(strategyData?.createdAt)}
        />
      </div>

      {/* Two-column content — container query reacts to actual width, not viewport */}
      <div className="[container-type:inline-size] flex gap-spacing-24 flex-1 px-spacing-24 pt-spacing-20 flex-wrap pb-4">
        {/* Left column — main content */}
        <div className="flex-1 min-w-[400px] flex flex-col gap-spacing-20">
          <StrategyDetailSchedule
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
            currentReturn={currentReturn}
            chartData={chartData}
            chartDates={chartDates}
            portfolioData={portfolioData}
            isLoading={isChartLoading}
          />
          <StrategyDetailAiAnalysis />
          <StrategyDetailDescription
            description={
              strategyData?.textDescription || strategyData?.description
            }
          />

          <StrategyDetailConnectionConditions
            isQualRequired={strategyData?.isQualRequired}
            clientRiskCategory={strategyData?.clientRiskCategory}
          />
          <StrategyDetailTariffs />
        </div>

        {/* Right column — sidebar; single card container */}
        <StrategyDetailSidebar
          strategyData={strategyData}
          onConnectClick={() => setConnectModalOpen(true)}
          className="mt-[-35px]"
        />
      </div>

      <ConnectStrategyModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        strategyName={strategyData?.title}
      />
    </div>
  );
};

export default StrategiesCatalogDetailPage;

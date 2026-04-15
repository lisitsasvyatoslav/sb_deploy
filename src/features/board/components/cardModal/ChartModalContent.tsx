'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { useTickerChartData } from '@/features/ticker/hooks/useTickerChartData';
import { useCardOperations } from '@/features/board/hooks/useCardOperations';
import TickerDetailContent from '@/features/ticker/components/TickerDetailContent';
import type { Card } from '@/types';

type ChartPeriod = 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all';

interface ChartModalContentProps {
  card: Card;
  boardId: number;
}

export function ChartModalContent({ card, boardId }: ChartModalContentProps) {
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);
  const ops = useCardOperations(card.id, boardId);

  const securityId = card.meta?.security_id as number | undefined;

  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(
    (card.meta?.chartPeriod as ChartPeriod) || 'all'
  );

  // Re-initialize period when security changes
  useEffect(() => {
    if (securityId) {
      setSelectedPeriod((card.meta?.chartPeriod as ChartPeriod) || 'all');
    }
  }, [securityId, card.meta?.chartPeriod]);

  // Persist period to card meta
  useEffect(() => {
    if (selectedPeriod) {
      ops.updateMeta({ chartPeriod: selectedPeriod });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const {
    data: chartData,
    isLoading,
    isError,
  } = useTickerChartData({
    security_id: securityId ?? 0,
    period: selectedPeriod,
    enabled: !!securityId,
  });

  const periods = useMemo<Array<{ key: ChartPeriod; label: string }>>(
    () => [
      { key: 'all', label: t('periods.allTime') },
      { key: 'Y', label: t('periods.year') },
      { key: 'Q', label: t('periods.quarter') },
      { key: 'M', label: t('periods.month') },
      { key: 'W', label: t('periods.week') },
      { key: 'D', label: t('periods.day') },
    ],
    [t]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">
            {t('info.loadingData')}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !chartData) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        {t('info.errorLoad')}
      </div>
    );
  }

  return (
    <TickerDetailContent
      chartData={chartData}
      periods={periods}
      selectedPeriod={selectedPeriod}
      onPeriodChange={(period) => setSelectedPeriod(period as ChartPeriod)}
      locale={locale}
      t={t}
    />
  );
}

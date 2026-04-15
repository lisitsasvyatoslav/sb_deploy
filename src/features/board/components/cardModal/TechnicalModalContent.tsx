'use client';

import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import TechnicalDetailContent from '@/features/ticker/components/TechnicalDetailContent';
import type { TechnicalAnalysisData } from '@/types/ticker';
import type { Card } from '@/types';

interface TechnicalModalContentProps {
  card: Card;
}

export function TechnicalModalContent({ card }: TechnicalModalContentProps) {
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);

  const techData = (card.meta?.technicalData || card.meta) as unknown as
    | TechnicalAnalysisData
    | undefined;

  if (!techData) return null;

  return (
    <TechnicalDetailContent
      techData={techData}
      locale={locale}
      t={t as TranslateFn}
    />
  );
}

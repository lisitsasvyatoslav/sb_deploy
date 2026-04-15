'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import FundamentalDetailContent from '@/features/ticker/components/FundamentalDetailContent';
import type { FundamentalData } from '@/types/ticker';
import type { Card } from '@/types';

interface FundamentalModalContentProps {
  card: Card;
}

export function FundamentalModalContent({
  card,
}: FundamentalModalContentProps) {
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);

  const fundamentalData = card.meta?.fundamentalData as
    | FundamentalData
    | undefined;

  if (!fundamentalData) return null;

  return (
    <FundamentalDetailContent
      fundamentalData={fundamentalData}
      locale={locale}
      t={t}
    />
  );
}

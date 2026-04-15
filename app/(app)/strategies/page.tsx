'use client';

import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import BoardSectionPage from '@/views/BoardSectionPage';
import { getBoardSectionConfigs } from '@/shared/config/boardSections';

export default function Strategies() {
  const { t } = useTranslation('common');
  return (
    <BoardSectionPage
      config={getBoardSectionConfigs(t as TranslateFn).strategy}
    />
  );
}

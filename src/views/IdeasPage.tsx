'use client';

import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import BoardSectionPage from './BoardSectionPage';
import { getBoardSectionConfigs } from '@/shared/config/boardSections';

const IdeasPage = () => {
  const { t } = useTranslation('common');
  return (
    <BoardSectionPage config={getBoardSectionConfigs(t as TranslateFn).main} />
  );
};

export default IdeasPage;

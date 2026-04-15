'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBoardMutation } from '@/features/board/queries';
import { getBoardSectionConfigs } from '@/shared/config/boardSections';
import { CreateBoardDialog } from '@/shared/ui/CreateBoardDialog';
import { useYandexMetrika } from '@/shared/hooks';
import { logger } from '@/shared/utils/logger';
import { showErrorToast } from '@/shared/utils/toast';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';

interface SidebarCreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
}

const SidebarCreateBoardDialog: React.FC<SidebarCreateBoardDialogProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const createBoardMutation = useCreateBoardMutation();
  const config = useMemo(
    () => getBoardSectionConfigs(t as TranslateFn).main,
    [t]
  );
  const { trackEvent } = useYandexMetrika();

  const handleSubmit = useCallback(
    async (data: { name: string; description?: string }) => {
      try {
        const newBoard = await createBoardMutation.mutateAsync({
          name: data.name,
          description: data.description,
        });
        trackEvent(config.trackEventName, { board_id: newBoard.id });
        onClose();
        router.push(config.detailRoute(newBoard.id));
      } catch (err) {
        logger.error('Sidebar', 'Failed to create board', err);
        showErrorToast(t('mainPage.createBoardError'));
        throw err;
      }
    },
    [createBoardMutation, config, trackEvent, onClose, router, t]
  );

  if (!open) return null;

  return (
    <CreateBoardDialog
      open={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={config.createDialogTitle}
      nameLabel={config.createDialogNameLabel}
      namePlaceholder={config.createDialogNamePlaceholder}
    />
  );
};

export default React.memo(SidebarCreateBoardDialog);

'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { BoardSectionConfig } from '@/shared/config/boardSections';
import { CreateBoardDialog } from '@/shared/ui/CreateBoardDialog';
import {
  useBoardsAllQuery,
  useCreateBoardMutation,
} from '@/features/board/queries';
import { useStrategiesQuery } from '@/features/strategy/queries';
import { PublishToMarketplaceModal } from '@/features/strategy/components/PublishToMarketplaceModal';
import { useDevStrategyCatalog } from '@/shared/hooks/useDevStrategyCatalog';
import { IdeasGridView, IdeasListView } from '@/features/ideas';
import { useYandexMetrika } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import { useViewStore } from '@/stores/appViewStore';
import { showErrorToast } from '@/shared/utils/toast';

interface BoardSectionPageProps {
  config: BoardSectionConfig;
}

const BoardSectionPage: React.FC<BoardSectionPageProps> = ({ config }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);

  const {
    data: boards,
    isLoading,
    error,
  } = useBoardsAllQuery({ section: config.sectionFilter });
  const createBoardMutation = useCreateBoardMutation();
  const { trackEvent } = useYandexMetrika();
  const isPublishFeatureEnabled = useDevStrategyCatalog();
  const [publishBoardId, setPublishBoardId] = useState<number | null>(null);

  const { data: boardStrategies } = useStrategiesQuery(publishBoardId ?? 0);
  const publishStrategy = boardStrategies?.[0];

  const handlePublish = useCallback((boardId: number) => {
    setPublishBoardId(boardId);
  }, []);

  const handleBoardClick = useCallback(
    (boardId: number) => {
      router.push(config.detailRoute(boardId));
    },
    [router, config]
  );

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleCreateBoard = useCallback(
    async (data: { name: string }) => {
      try {
        const newBoard = await createBoardMutation.mutateAsync({
          name: data.name,
          template: config.sectionFilter,
        });

        trackEvent(config.trackEventName, {
          board_id: newBoard.id,
        });

        setIsCreateDialogOpen(false);
        router.push(config.detailRoute(newBoard.id));
      } catch (err) {
        logger.error('BoardSectionPage', 'Failed to create board', err);
        showErrorToast(t('mainPage.createBoardError'));
        throw err;
      }
    },
    [createBoardMutation, trackEvent, config, t]
  );

  return (
    <div className="w-full h-full relative bg-[var(--bg-base)]">
      {viewMode === 'grid' ? (
        <IdeasGridView
          boards={boards || []}
          isLoading={isLoading}
          error={error}
          onBoardClick={handleBoardClick}
          onCreateBoard={handleOpenCreateDialog}
          detailRoute={config.detailRoute}
          gridSubMode={viewMode}
          onGridSubModeChange={setViewMode}
          title={config.title}
          createButtonLabel={config.createButtonLabel}
          previewImage={config.previewImage}
          onPublish={isPublishFeatureEnabled ? handlePublish : undefined}
        />
      ) : (
        <IdeasListView
          boards={boards || []}
          isLoading={isLoading}
          error={error}
          onBoardClick={handleBoardClick}
          onCreateBoard={handleOpenCreateDialog}
          detailRoute={config.detailRoute}
          gridSubMode={viewMode}
          onGridSubModeChange={setViewMode}
          title={config.title}
          createButtonLabel={config.createButtonLabel}
          previewImage={config.previewImage}
          onPublish={isPublishFeatureEnabled ? handlePublish : undefined}
        />
      )}

      <CreateBoardDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateBoard}
        title={config.createDialogTitle}
        nameLabel={config.createDialogNameLabel}
        namePlaceholder={config.createDialogNamePlaceholder}
      />

      {publishBoardId !== null && publishStrategy && (
        <PublishToMarketplaceModal
          open={publishBoardId !== null}
          onOpenChange={(open) => {
            if (!open) setPublishBoardId(null);
          }}
          strategyId={publishStrategy.id}
          strategyName={publishStrategy.name}
          strategyDescription={publishStrategy.description}
        />
      )}
    </div>
  );
};

export default BoardSectionPage;

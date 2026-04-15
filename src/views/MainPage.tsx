'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/shared/utils/logger';

import { CreateBoardDialog } from '@/shared/ui/CreateBoardDialog';
import { SelectBoardForNewsDialog } from '@/features/news/components/SelectBoardForNewsDialog';
import { ConfirmAddNewsToBoard } from '@/features/news/components/ConfirmAddNewsToBoard';
import {
  useBoardsAllQuery,
  useCreateBoardMutation,
  useCreateCardMutation,
} from '@/features/board/queries';
import { IdeasGridView, IdeasListView } from '@/features/ideas';
import { useYandexMetrika } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import { useViewStore } from '@/stores/appViewStore';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { buildNewsCardRequest } from '@/features/board/utils/newsCardBuilder';
import type { NewsItemForCard } from '@/features/board/utils/newsCardBuilder';
import type { Board } from '@/types';

interface PendingNewsState {
  newsData: NewsItemForCard;
  board?: Board;
}

const MainPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);

  const { data: boards, isLoading, error } = useBoardsAllQuery();
  const createBoardMutation = useCreateBoardMutation();
  const createCardMutation = useCreateCardMutation();
  const { trackEvent } = useYandexMetrika();

  // DnD state: news dropped onto specific board → confirm dialog
  // news dropped outside boards → select dialog
  const [pendingNews, setPendingNews] = useState<PendingNewsState | null>(null);
  const [isNewsDragOver, setIsNewsDragOver] = useState(false);
  // True while cursor is over a specific board card — suppress page-level highlight
  const [isOverBoard, setIsOverBoard] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleBoardClick = useCallback(
    (boardId: number) => {
      router.push(`/ideas/${boardId}`);
    },
    [router]
  );

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleCreateBoard = useCallback(
    async (data: { name: string }) => {
      try {
        const newBoard = await createBoardMutation.mutateAsync({
          name: data.name,
        });

        trackEvent('board_create', {
          board_id: newBoard.id,
        });

        setIsCreateDialogOpen(false);
        router.push(`/ideas/${newBoard.id}`);
      } catch (err) {
        logger.error('MainPage', 'Failed to create board', err);
        showErrorToast(t('mainPage.createBoardError'));
      }
    },
    [createBoardMutation, trackEvent, t, router]
  );

  const createNewsCardInBoard = useCallback(
    async (newsData: NewsItemForCard, boardId: number) => {
      const cardData = buildNewsCardRequest(newsData, boardId);
      await createCardMutation.mutateAsync(cardData);
    },
    [createCardMutation]
  );

  // Drop on specific board card → show confirm dialog
  const handleNewsDrop = useCallback(
    (board: Board, newsData: NewsItemForCard) => {
      setIsNewsDragOver(false);
      setIsOverBoard(false);
      setPendingNews({ board, newsData });
    },
    []
  );

  // Confirm: add news to the specific board
  const handleConfirmDrop = useCallback(async () => {
    if (!pendingNews?.board) return;
    try {
      await createNewsCardInBoard(pendingNews.newsData, pendingNews.board.id);
      showSuccessToast(t('selectBoardForNews.newsAdded'));
      trackEvent('news_drop_to_board', { board_id: pendingNews.board.id });
    } catch (err) {
      logger.error('MainPage', 'Failed to drop news to board', err);
      showErrorToast(t('selectBoardForNews.newsAddError'));
    } finally {
      setPendingNews(null);
    }
  }, [pendingNews, createNewsCardInBoard, t, trackEvent]);

  // Drop elsewhere → select board dialog → add to selected boards
  const handleSelectBoardAdd = useCallback(
    async (boardIds: number[]) => {
      if (!pendingNews?.newsData) return;
      const settled = await Promise.allSettled(
        boardIds.map((boardId) =>
          createNewsCardInBoard(pendingNews.newsData, boardId).then(() => {
            trackEvent('news_drop_to_board', { board_id: boardId });
          })
        )
      );

      const successCount = settled.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      settled.forEach((r) => {
        if (r.status === 'rejected') {
          logger.error('MainPage', 'Failed to add news to board', r.reason);
          showErrorToast(t('selectBoardForNews.newsAddError'));
        }
      });

      if (successCount > 0) {
        const msg =
          successCount === 1
            ? t('selectBoardForNews.newsAdded')
            : t('selectBoardForNews.newsAddedToBoards', {
                count: successCount,
              });
        showSuccessToast(msg);
      }
    },
    [pendingNews, createNewsCardInBoard, t, trackEvent]
  );

  // Global drag handlers: show brand overlay + open SelectBoardForNewsDialog on drop outside board cards
  const handleContentDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/news-data')) return;
    e.preventDefault();
    setIsNewsDragOver(true);
  }, []);

  const handleContentDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear when leaving the content container itself, not when entering children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsNewsDragOver(false);
  }, []);

  const handleContentDrop = useCallback((e: React.DragEvent) => {
    // Board cards stop propagation when dropped on them, so this handler
    // only fires when the drop target is outside any board card
    setIsNewsDragOver(false);
    setIsOverBoard(false);
    if (!e.dataTransfer.types.includes('application/news-data')) return;
    e.preventDefault();
    const newsDataStr = e.dataTransfer.getData('application/news-data');
    if (!newsDataStr) return;
    try {
      const newsData = JSON.parse(newsDataStr) as NewsItemForCard;
      setPendingNews({ newsData });
    } catch {
      // malformed drag data
    }
  }, []);

  const isSelectDialogOpen = !!pendingNews && !pendingNews.board;
  const isConfirmDialogOpen = !!pendingNews?.board;
  // Show page overlay only when dragging over the general area (not over a specific board card)
  const showPageHighlight = isNewsDragOver && !isOverBoard;

  return (
    <div
      ref={contentRef}
      className="w-full h-full relative bg-[var(--bg-base)] transition-colors duration-150"
      style={
        showPageHighlight
          ? {
              outline: '2px dashed var(--brand-primary)',
              outlineOffset: '-2px',
              background: 'var(--brand-bg_deep)',
            }
          : undefined
      }
      onDragOver={handleContentDragOver}
      onDragLeave={handleContentDragLeave}
      onDrop={handleContentDrop}
    >
      {viewMode === 'grid' ? (
        <IdeasGridView
          boards={boards || []}
          isLoading={isLoading}
          error={error}
          onBoardClick={handleBoardClick}
          onCreateBoard={handleOpenCreateDialog}
          detailRoute={(id) => `/ideas/${id}`}
          gridSubMode={viewMode}
          onGridSubModeChange={setViewMode}
          title={t('mainPage.boards')}
          createButtonLabel={t('mainPage.createBoard')}
          onNewsDrop={handleNewsDrop}
          onBoardDragActiveChange={setIsOverBoard}
        />
      ) : (
        <IdeasListView
          boards={boards || []}
          isLoading={isLoading}
          error={error}
          onBoardClick={handleBoardClick}
          onCreateBoard={handleOpenCreateDialog}
          detailRoute={(id) => `/ideas/${id}`}
          gridSubMode={viewMode}
          onGridSubModeChange={setViewMode}
          title={t('mainPage.boards')}
          createButtonLabel={t('mainPage.createBoard')}
        />
      )}

      <CreateBoardDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateBoard}
      />

      <ConfirmAddNewsToBoard
        isOpen={isConfirmDialogOpen}
        boardName={pendingNews?.board?.name ?? ''}
        onClose={() => setPendingNews(null)}
        onConfirm={handleConfirmDrop}
      />

      <SelectBoardForNewsDialog
        isOpen={isSelectDialogOpen}
        onClose={() => setPendingNews(null)}
        onAdd={handleSelectBoardAdd}
      />
    </div>
  );
};

export default MainPage;

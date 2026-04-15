/**
 * useSelectionToolbar.ts - Toolbar actions for selected cards
 *
 * Functions:
 * - useSelectionToolbar({ boardId, ... })     Main hook: toolbar action handlers
 * - handleToolbarAskAI()                      Send selected cards to AI chat
 * - handleToolbarAskAINewsFeed()              Create news cards from feed and send to AI
 * - handleToolbarChangeFilters()              Open news feed filter editor
 * - handleToolbarOpen()                       Open card in appropriate viewer/editor
 * - handleToolbarDelete()                     Delete selected cards (with signal confirmation)
 * - handleToolbarColorChange(color)           Change header color of selected cards
 * - currentColor                               Color of the first selected card (memoized)
 * - getSelectedCardType()                     Get type of single selected card
 * - handleConfirmDelete()                     Confirm signal card deletion
 * - handleCancelDelete()                      Cancel deletion dialog
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useChartExport,
  type ExportFormat,
} from '@/features/board/hooks/useChartExport';
import { useReactFlow } from '@xyflow/react';
import { DEFAULT_CARD_COLOR } from '@/features/board/components/CardSelectionToolbar';
import { getFlowCenterPosition } from '@/features/board/utils/viewportUtils';
import { buildTagsFromNews } from '@/features/board/utils/newsTagMapper';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useCardModalStore } from '@/stores/cardModalStore';
import { useBoardStore } from '@/stores/boardStore';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useChatStore } from '@/stores/chatStore';
import { useNewsFeedConfigStore } from '@/stores/newsFeedConfigStore';
import { useNewsFeedWidgetStore } from '@/stores/newsFeedWidgetStore';
import { useTranslation } from '@/shared/i18n/client';
import { showInfoToast, showSuccessToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';
import { BoardFullData } from '@/types';

interface UseSelectionToolbarConfig {
  boardId: number;
  boardData: BoardFullData | undefined;
  actions: ReturnType<typeof useBoardActions>;
  clearSelectionUI: () => void;
}

export const useSelectionToolbar = ({
  boardId,
  boardData,
  actions,
  clearSelectionUI,
}: UseSelectionToolbarConfig) => {
  const { t } = useTranslation('board');
  const queryClient = useQueryClient();
  const reactFlowInstance = useReactFlow();
  const selectedCards = useCardSelectionStore((s) => s.selectedCards);
  const { openConfig } = useNewsFeedConfigStore();
  const getNewsFeedItems = useNewsFeedWidgetStore((s) => s.getItems);
  const { createChatWithCards, addCardsToActiveChat, activeChatId } =
    useChatManager();
  const { openSidebar: openChatSidebar } = useChatStore();

  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    cardIds: number[];
    signalCount: number;
  }>({
    open: false,
    cardIds: [],
    signalCount: 0,
  });

  const handleToolbarAskAI = useCallback(async () => {
    if (selectedCards.length === 0) return;

    if (activeChatId) {
      addCardsToActiveChat(selectedCards, boardId);
    } else {
      await createChatWithCards(selectedCards, undefined, undefined, boardId);
      openChatSidebar();
    }

    clearSelectionUI();
  }, [
    selectedCards,
    createChatWithCards,
    addCardsToActiveChat,
    activeChatId,
    boardId,
    clearSelectionUI,
    openChatSidebar,
  ]);

  const handleToolbarChangeFilters = useCallback(() => {
    if (selectedCards.length !== 1) return;
    const cardId = selectedCards[0];
    const card = boardData?.cards?.find((c) => c.id === cardId);
    if (!card || card.meta?.widgetType !== 'news_feed') return;
    openConfig(cardId);
  }, [selectedCards, boardData?.cards, openConfig]);

  const handleToolbarAskAINewsFeed = useCallback(async () => {
    if (selectedCards.length !== 1) return;
    const cardId = selectedCards[0];
    const card = boardData?.cards?.find((c) => c.id === cardId);
    if (!card) return;

    const newsItems = getNewsFeedItems(cardId);
    if (newsItems.length === 0) {
      showInfoToast(t('toast.newsNotLoadedYet'));
      return;
    }

    try {
      const center = getFlowCenterPosition(reactFlowInstance);

      const results = await Promise.all(
        newsItems.map((news, i) => {
          const tags = buildTagsFromNews(news);
          return actions.createCard(
            {
              boardId,
              title: news.title || 'Untitled News',
              content: news.fullContent || news.content || '',
              type: 'news',
              tags,
              meta: {
                source: news.sourceName || news.source,
                timestamp: news.timestamp,
                url: news.sourceUrl,
                newsId: news.id,
              },
            },
            { x: center.x + (i - 2) * 360, y: center.y + 300 }
          );
        })
      );
      const createdIds = results
        .filter((c): c is NonNullable<typeof c> => c?.id != null)
        .map((c) => c.id);

      if (activeChatId) {
        addCardsToActiveChat(createdIds, boardId);
      } else {
        await createChatWithCards(createdIds, undefined, undefined, boardId);
        openChatSidebar();
      }

      clearSelectionUI();
    } catch (error) {
      logger.error('useBoard', 'Failed to link news feed items to AI', error);
    }
  }, [
    selectedCards,
    boardData?.cards,
    boardId,
    getNewsFeedItems,
    actions,
    activeChatId,
    addCardsToActiveChat,
    createChatWithCards,
    openChatSidebar,
    clearSelectionUI,
  ]);

  const handleToolbarOpen = useCallback(() => {
    if (!boardData || selectedCards.length !== 1) return;
    const cardId = selectedCards[0];
    const card = boardData.cards?.find((c) => c.id === cardId);
    if (card) {
      useCardModalStore.getState().open(card.id, boardId);
    }
  }, [boardData, selectedCards, boardId]);

  const handleToolbarDelete = useCallback(async () => {
    if (selectedCards.length === 0) return;

    const idsToDelete = selectedCards;

    const signalCards =
      boardData?.cards?.filter(
        (card) => idsToDelete.includes(card.id) && card.type === 'signal'
      ) || [];

    const signalCount = signalCards.length;

    if (signalCount > 0) {
      setDeleteConfirmDialog({
        open: true,
        cardIds: idsToDelete,
        signalCount,
      });
    } else {
      clearSelectionUI();

      try {
        await Promise.all(idsToDelete.map((id) => actions.deleteCard(id)));
        const count = idsToDelete.length;
        const message =
          count === 1
            ? t('toast.cardDeleted')
            : t('toast.cardsDeleted', { count });
        showSuccessToast(message);
      } catch (error) {
        logger.error('useSelectionToolbar', 'Batch delete failed', error);
      }
    }
  }, [actions, selectedCards, boardData, clearSelectionUI, t]);

  const getSelectedCardType = useCallback((): string | undefined => {
    if (selectedCards.length !== 1) return undefined;
    const card = boardData?.cards?.find((c) => c.id === selectedCards[0]);
    if (card?.type === 'widget' && card.meta?.widgetType) {
      return card.meta.widgetType as string;
    }
    return card?.type;
  }, [selectedCards, boardData]);

  const handleConfirmDelete = useCallback(async () => {
    const idsToDelete = deleteConfirmDialog.cardIds;
    const hasSignals = deleteConfirmDialog.signalCount > 0;

    setDeleteConfirmDialog({ open: false, cardIds: [], signalCount: 0 });
    clearSelectionUI();

    try {
      await Promise.all(idsToDelete.map((id) => actions.deleteCard(id)));

      const count = idsToDelete.length;
      const message =
        count === 1
          ? t('toast.cardDeleted')
          : t('toast.cardsDeleted', { count });
      showSuccessToast(message);

      if (hasSignals) {
        queryClient.invalidateQueries({ queryKey: ['signals'] });
      }
    } catch (error) {
      logger.error('useSelectionToolbar', 'Confirm delete failed', error);
    }
  }, [deleteConfirmDialog, actions, clearSelectionUI, queryClient, t]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmDialog({ open: false, cardIds: [], signalCount: 0 });
  }, []);

  // Export handler — only active for single chart card
  const selectedChartCardId =
    selectedCards.length === 1
      ? (() => {
          const card = boardData?.cards?.find((c) => c.id === selectedCards[0]);
          return card?.type === 'chart' ? card.id : undefined;
        })()
      : undefined;

  const { exportChart } = useChartExport(selectedChartCardId ?? 0);

  const handleToolbarExport = useCallback(
    (format: ExportFormat) => {
      if (!selectedChartCardId) return;
      exportChart(format);
    },
    [selectedChartCardId, exportChart]
  );

  // True when a single news_feed widget is selected
  const selectedCard =
    selectedCards.length === 1
      ? boardData?.cards?.find((c) => c.id === selectedCards[0])
      : undefined;

  const isSelectedNewsFeed =
    selectedCard?.type === 'widget' &&
    selectedCard.meta?.widgetType === 'news_feed';

  const handleToolbarRename = useCallback(() => {
    if (!boardData || selectedCards.length !== 1) return;
    const card = boardData.cards?.find((c) => c.id === selectedCards[0]);
    if (card) {
      useBoardUIStore.getState().setTitleEditCardId(card.id);
    }
  }, [boardData, selectedCards]);

  return {
    handleToolbarDelete,

    toolbarHandlers: {
      onRename: handleToolbarRename,
      onAskAI: isSelectedNewsFeed
        ? handleToolbarAskAINewsFeed
        : handleToolbarAskAI,
      onOpen: handleToolbarOpen,
      onDelete: handleToolbarDelete,
      selectedCardType: getSelectedCardType(),
      onChangeFilters: isSelectedNewsFeed
        ? handleToolbarChangeFilters
        : undefined,
      onExport: selectedChartCardId ? handleToolbarExport : undefined,
    },

    deleteConfirmDialogProps: {
      open: deleteConfirmDialog.open,
      cardCount: deleteConfirmDialog.cardIds.length,
      signalCount: deleteConfirmDialog.signalCount,
      onConfirm: handleConfirmDelete,
      onCancel: handleCancelDelete,
    },
  };
};

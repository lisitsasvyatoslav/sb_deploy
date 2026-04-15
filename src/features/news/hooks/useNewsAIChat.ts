import { useCallback } from 'react';
import type { NewsItem } from 'finsignal-feed-explore';
import type { CreateCardRequest } from '@/types';
import { logger } from '@/shared/utils/logger';
import { usePositionedCreateCardMutation } from '@/features/board/queries';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useChatStore } from '@/stores/chatStore';
import { useYandexMetrika } from '@/shared/hooks';

interface UseNewsAIChatParams {
  boardId: number | null;
  buildNewsCardData: (
    news: NewsItem,
    targetBoardId: number
  ) => CreateCardRequest;
  setPendingNews: (news: NewsItem | null) => void;
  setPendingAction: (action: 'bookmark' | 'ai') => void;
  handleAddNewsToBoardIds: (
    news: NewsItem,
    boardIds: number[]
  ) => Promise<number[]>;
  pendingNews: NewsItem | null;
  pendingAction: 'bookmark' | 'ai';
}

export function useNewsAIChat({
  boardId,
  buildNewsCardData,
  setPendingNews,
  setPendingAction,
  handleAddNewsToBoardIds,
  pendingNews,
  pendingAction,
}: UseNewsAIChatParams) {
  const { trackEvent } = useYandexMetrika();
  const { activeChatId, createChatWithCards, addCardsToActiveChat } =
    useChatManager();
  const { openSidebar: openChatSidebar } = useChatStore();
  const createCardMutation = usePositionedCreateCardMutation();

  const handleAIClick = useCallback(
    async (news: NewsItem) => {
      if (!boardId) {
        setPendingNews(news);
        setPendingAction('ai');
        return;
      }

      try {
        const cardData = buildNewsCardData(news, boardId);
        const createdCard = await createCardMutation.mutateAsync(cardData);
        const cardId = createdCard.id;
        trackEvent('explore_ai_click', {
          board_id: boardId,
          news_id: news.id,
          ticker: news.stocks?.[0]?.symbol,
        });

        if (!activeChatId) {
          await createChatWithCards([cardId], undefined, undefined, boardId);
          openChatSidebar();
        } else {
          addCardsToActiveChat([cardId], boardId);
        }
      } catch (error) {
        logger.error('NewsSidebar', 'Failed to add news to chat', error);
      }
    },
    [
      boardId,
      buildNewsCardData,
      createCardMutation,
      activeChatId,
      createChatWithCards,
      addCardsToActiveChat,
      openChatSidebar,
      trackEvent,
      setPendingNews,
      setPendingAction,
    ]
  );

  const handleSelectBoardAdd = useCallback(
    async (boardIds: number[]) => {
      if (!pendingNews) return;
      const news = pendingNews;
      const cardIds = await handleAddNewsToBoardIds(news, boardIds);

      if (pendingAction === 'ai' && cardIds.length > 0) {
        const firstBoardId = boardIds[0];
        if (!activeChatId) {
          await createChatWithCards(
            [cardIds[0]],
            undefined,
            undefined,
            firstBoardId
          );
          openChatSidebar();
        } else {
          addCardsToActiveChat([cardIds[0]], firstBoardId);
        }
      }
    },
    [
      pendingNews,
      pendingAction,
      handleAddNewsToBoardIds,
      activeChatId,
      createChatWithCards,
      addCardsToActiveChat,
      openChatSidebar,
    ]
  );

  return {
    handleAIClick,
    handleSelectBoardAdd,
  };
}

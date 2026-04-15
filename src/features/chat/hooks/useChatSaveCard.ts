import { useCallback, useState } from 'react';
import {
  useHomeBoardQuery,
  usePositionedCreateCardMutation,
} from '@/features/board/queries';
import { currentBoard } from '@/services/api/client';
import { useChatStore } from '@/stores/chatStore';
import { Card, CreateCardRequest } from '@/types';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';

interface UseChatSaveCardParams {
  activeChatId: number | null;
  boardId: number | null;
  allCards: Card[];
  chatContextCards: Record<number, number[]>;
  viewportCenterRef: React.MutableRefObject<{ x: number; y: number }>;
  onRefreshBoardRef: React.MutableRefObject<(() => void) | undefined>;
  handleNotify: (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export function useChatSaveCard({
  activeChatId,
  boardId,
  allCards,
  chatContextCards,
  viewportCenterRef,
  onRefreshBoardRef,
  handleNotify,
}: UseChatSaveCardParams) {
  const { t } = useTranslation('chat');
  const { data: homeBoardData } = useHomeBoardQuery();
  const createCardMutation = usePositionedCreateCardMutation();

  const [contextCards, setContextCards] = useState<Card[]>([]);

  // Load context cards from store
  const loadContextCards = useCallback(() => {
    if (activeChatId) {
      const cardIds = chatContextCards[activeChatId] || [];
      const filteredCards = allCards.filter((c) => cardIds.includes(c.id));
      setContextCards(filteredCards);
    } else {
      setContextCards([]);
    }
  }, [activeChatId, allCards, chatContextCards]);

  const handleSaveResponseAsCard = useCallback(
    async (
      messageId: number,
      promptTitle: string,
      response: string,
      contextCardsIds: number[]
    ) => {
      if (!activeChatId) return;

      // Validate board_id with fallback chain: Zustand -> localStorage -> Home board
      const effectiveBoardId =
        boardId ?? currentBoard.getId() ?? homeBoardData?.id;
      if (!effectiveBoardId) {
        logger.error('ChatManager', 'Cannot save card: boardId is null');
        handleNotify(t('manager.boardNotSelected'), 'error');
        return;
      }

      const center = viewportCenterRef.current;

      try {
        const cardData: CreateCardRequest = {
          boardId: effectiveBoardId,
          title: promptTitle,
          type: 'ai_response',
          content: response,
          x: center.x,
          y: center.y,
          zIndex: 0,
          meta: {
            ai_node_id: activeChatId,
            message_id: messageId,
            context_cards: contextCardsIds,
            timestamp: new Date().toISOString(),
            is_ai_response: true,
          },
        };

        await createCardMutation.mutateAsync(cardData);
        handleNotify(t('manager.answerSaved'), 'success');
        onRefreshBoardRef.current?.();
      } catch (error) {
        logger.error('ChatManager', 'Error saving response as card', error);
        handleNotify(t('manager.cardCreateError'), 'error');
      }
    },
    [
      activeChatId,
      boardId,
      homeBoardData?.id,
      createCardMutation,
      handleNotify,
      t,
    ]
  );

  const handleRemoveCard = useCallback(
    async (cardId: number) => {
      if (!activeChatId) return;

      try {
        const { chatContextCards: currentChatCards, setChatContextCards } =
          useChatStore.getState();
        const currentCardIds = currentChatCards[activeChatId] || [];
        const newCardIds = currentCardIds.filter((id) => id !== cardId);
        setChatContextCards(activeChatId, newCardIds);

        setContextCards((prev) => prev.filter((c) => c.id !== cardId));
      } catch (error) {
        logger.error('ChatManager', 'Error removing card', error);
      }
    },
    [activeChatId]
  );

  return {
    contextCards,
    setContextCards,
    loadContextCards,
    handleSaveResponseAsCard,
    handleRemoveCard,
  };
}

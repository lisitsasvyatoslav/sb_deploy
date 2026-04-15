import { useCallback } from 'react';
import { useChatStore, type ChatTradesLabelType } from '@/stores/chatStore';
import { useCreateChatMutation } from '@/features/chat/queries';
import { useTranslation } from '@/shared/i18n/client';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { logger } from '@/shared/utils/logger';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '@/shared/utils/toast';

export const useChatManager = () => {
  const { t } = useTranslation('chat');
  const {
    activeChatId,
    setActiveChatId,
    toggleSidebar,
    openSidebar,
    setChatContextCards,
    addCardsToChatContext,
    chatContextCards,
  } = useChatStore();
  const createChatMutation = useCreateChatMutation();
  const { trackEvent } = useYandexMetrika();

  const createChatWithCards = useCallback(
    async (
      selectedCards: number[],
      onSuccess?: (chatId: number) => void,
      onError?: (error: unknown) => void,
      boardId?: number
    ) => {
      try {
        const chat = await createChatMutation.mutateAsync({
          name:
            selectedCards.length > 0
              ? t('manager.chatWithCards', { count: selectedCards.length })
              : t('manager.defaultChat'),
          systemPromptId: 'default',
        });

        if (selectedCards.length > 0) {
          setChatContextCards(chat.id, selectedCards);

          // Track note_send_to_chat for each card
          selectedCards.forEach((cardId) => {
            trackEvent('note_send_to_chat', {
              board_id: boardId || 0,
              card_id: cardId,
              chat_id: chat.id,
            });
          });
        }

        // Track chat_create event
        trackEvent('chat_create', {
          chat_id: chat.id,
        });

        setActiveChatId(chat.id);
        onSuccess?.(chat.id);
        return chat.id;
      } catch (error) {
        logger.error('useChatManager', 'Error creating chat with cards', error);
        onError?.(error);
        throw error;
      }
    },
    [createChatMutation, setActiveChatId, setChatContextCards, trackEvent, t]
  );

  const createChatWithTrades = useCallback(
    async (
      tradeIds: number[],
      chatName?: string,
      tickerSecurityIds?: Record<string, number | null>,
      labelType: ChatTradesLabelType = 'tickers',
      selectedCount?: number,
      onSuccess?: (chatId: number) => void,
      onError?: (error: unknown) => void
    ) => {
      try {
        const chat = await createChatMutation.mutateAsync({
          name: chatName || t('manager.analyzeDeals'),
          systemPromptId: 'default',
        });

        // Store trades and tickers in memory using chatStore
        if (tradeIds.length > 0 && tickerSecurityIds) {
          const { setChatTradesContext } = useChatStore.getState();
          setChatTradesContext({
            chatId: chat.id,
            tradeIds,
            tickerSecurityIds,
            labelType,
            selectedCount,
          });
        }

        // Track chat_create event
        trackEvent('chat_create', {
          chat_id: chat.id,
        });

        setActiveChatId(chat.id);
        onSuccess?.(chat.id);
        return chat.id;
      } catch (error) {
        logger.error(
          'useChatManager',
          'Error creating chat with trades',
          error
        );
        onError?.(error);
        throw error;
      }
    },
    [createChatMutation, setActiveChatId, trackEvent, t]
  );

  const addCardsToActiveChat = useCallback(
    (cardIds: number[], boardId?: number, onCardsUpdated?: () => void) => {
      if (!activeChatId || cardIds.length === 0) {
        return;
      }

      try {
        // Add cards to chat context in store and get count of newly added cards
        const newlyAddedCount = addCardsToChatContext(activeChatId, cardIds);

        // Track note_send_to_chat for each newly added card
        const existingCards = chatContextCards[activeChatId] || [];
        const newlyAddedCards = cardIds.filter(
          (id) => !existingCards.includes(id)
        );

        newlyAddedCards.forEach((cardId) => {
          trackEvent('note_send_to_chat', {
            board_id: boardId || 0,
            card_id: cardId,
            chat_id: activeChatId,
          });
        });

        // Open sidebar to show the chat
        openSidebar();

        // Notify parent component to reload context cards
        onCardsUpdated?.();

        // Show appropriate message based on how many cards were actually added
        if (newlyAddedCount === 0) {
          showInfoToast(t('manager.allCardsAdded'));
        } else {
          showSuccessToast(t('manager.cardsAdded', { count: newlyAddedCount }));
        }
      } catch (error) {
        logger.error(
          'useChatManager',
          'Error adding cards to active chat',
          error
        );
        showErrorToast(t('manager.cardsAddError'));
      }
    },
    [
      activeChatId,
      addCardsToChatContext,
      chatContextCards,
      openSidebar,
      trackEvent,
      t,
    ]
  );

  return {
    activeChatId,
    setActiveChatId,
    toggleSidebar,
    createChatWithCards,
    createChatWithTrades,
    addCardsToActiveChat,
  };
};

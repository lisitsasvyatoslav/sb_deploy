import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi, type ToolProgressEvent } from '@/services/api/chat';
import { boardQueryKeys } from '@/features/board/queries';
import { YM_CHAT_TOOL_PROGRESS_META } from '@/features/chat/constants/yandexChatProgressMeta';
import { useChatSessionResume } from '@/features/chat/hooks/useChatSessionResume';
import { useSendMessageMutation } from '@/features/chat/queries';
import { useChatStore } from '@/stores/chatStore';
import { BoardFullData, Card, Message } from '@/types';
import { logger } from '@/shared/utils/logger';
import { showWarningToast } from '@/shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/shared/i18n/client';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';

interface UseChatMessagingParams {
  activeChatId: number | null;
  activeChatType: string;
  boardId: number | null;
  chatTradesContext: { chatId: number; tradeIds: number[] } | null;
  setMessagesCache: React.Dispatch<
    React.SetStateAction<Map<number, Message[]>>
  >;
  executePipeline: (
    instruction: string,
    context: {
      chatId: number;
      activeBoardId?: number;
      fileIds?: string[];
    }
  ) => Promise<void>;
  isPipelineExecuting: boolean;
  stopPipeline: () => void;
  refetchMessagesRef: React.MutableRefObject<() => Promise<unknown>>;
  onRefreshBoardRef: React.MutableRefObject<(() => void) | undefined>;
  clearToolProgress: () => void;
  updateToolProgress: (type: string, progress: ToolProgressEvent) => void;
  removeChatContextCards: (chatId: number) => void;
  removeAllTrades: () => void;
  setContextCards: React.Dispatch<React.SetStateAction<Card[]>>;
  setStopGeneration: (fn: (() => void) | null) => void;
  handleNotify: (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export function useChatMessaging({
  activeChatId,
  activeChatType,
  boardId,
  chatTradesContext,
  setMessagesCache,
  executePipeline,
  isPipelineExecuting,
  stopPipeline,
  refetchMessagesRef,
  onRefreshBoardRef,
  clearToolProgress,
  updateToolProgress,
  removeChatContextCards,
  removeAllTrades,
  setContextCards,
  setStopGeneration,
  handleNotify,
}: UseChatMessagingParams) {
  const { t } = useTranslation('chat');
  const { trackEvent } = useYandexMetrika();
  const sendMessageMutation = useSendMessageMutation();
  const queryClient = useQueryClient();

  // AbortController for stopping message generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Session resume state
  const [isResuming, setIsResuming] = useState(false);

  const { attemptResume } = useChatSessionResume({
    onChunk: (chunk: string) => {
      const chatId = useChatStore.getState().activeChatId;
      if (!chatId) return;
      setMessagesCache((prev) => {
        const newCache = new Map(prev);
        const currentMessages = newCache.get(chatId) || [];
        const lastAssistantIdx = [...currentMessages]
          .reverse()
          .findIndex((m) => m.role === 'assistant');
        if (lastAssistantIdx === -1) {
          const placeholder: Message = {
            id: Date.now(),
            chatId,
            userId: 'assistant',
            role: 'assistant',
            content: chunk,
            cardIds: [],
            tokenUsage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newCache.set(chatId, [...currentMessages, placeholder]);
        } else {
          const idx = currentMessages.length - 1 - lastAssistantIdx;
          const updatedMessages = currentMessages.map((msg, i) =>
            i === idx ? { ...msg, content: chunk } : msg
          );
          newCache.set(chatId, updatedMessages);
        }
        return newCache;
      });
    },
    onToolProgress: (progress) => {
      updateToolProgress(progress.type, progress);
    },
    onResumeStart: () => setIsResuming(true),
    onResumeEnd: (hadSession: boolean) => {
      setIsResuming(false);
      if (!hadSession) return;
      const chatId = useChatStore.getState().activeChatId;
      if (chatId) {
        setMessagesCache((prev) => {
          const newCache = new Map(prev);
          newCache.delete(chatId);
          return newCache;
        });
      }
      clearToolProgress();
      refetchMessagesRef.current();
    },
  });

  const handleStopGeneration = useCallback(() => {
    let stopped = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      stopped = true;
    }
    if (activeChatId) {
      chatApi.stopGeneration(activeChatId).catch(() => undefined);
      stopped = true;
    }
    if (stopped) {
      handleNotify(t('manager.generationStopped'), 'info');
    }
  }, [activeChatId, handleNotify, t]);

  // Register the active stop function in the store so ChatInput can read it directly
  useEffect(() => {
    const stopFn =
      activeChatType === 'pipeline' && isPipelineExecuting
        ? stopPipeline
        : handleStopGeneration;
    setStopGeneration(stopFn);
    return () => setStopGeneration(null);
  }, [
    activeChatType,
    isPipelineExecuting,
    stopPipeline,
    handleStopGeneration,
    setStopGeneration,
  ]);

  const handleSendMessage = useCallback(
    async (
      message: string,
      cardIds: number[],
      fileIds?: string[],
      model?: string,
      settings?: { maxTokens?: number | null; temperature?: number | null },
      tradeIds?: number[],
      linkUrls?: string[]
    ) => {
      if (!activeChatId) return;

      if (activeChatType === 'pipeline') {
        await executePipeline(message.trim(), {
          chatId: activeChatId,
          activeBoardId: boardId ?? undefined,
          fileIds: fileIds?.length ? fileIds : undefined,
        });
        refetchMessagesRef.current();
        return;
      }

      // Clear tool progress at the start
      clearToolProgress();

      abortControllerRef.current = new AbortController();

      const userMessage: Message = {
        id: Date.now(),
        chatId: activeChatId,
        userId: 'current_user',
        role: 'user',
        content: message,
        cardIds: cardIds,
        fileIds: fileIds,
        tradeIds: tradeIds,
        linkUrls: linkUrls,
        tokenUsage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const assistantMessageId = Date.now() + 1;
      const assistantMessage: Message = {
        id: assistantMessageId,
        chatId: activeChatId,
        userId: 'assistant',
        role: 'assistant',
        content: '',
        cardIds: cardIds,
        tokenUsage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessagesCache((prev) => {
        const newCache = new Map(prev);
        const currentMessages = newCache.get(activeChatId) || [];
        newCache.set(activeChatId, [
          ...currentMessages,
          userMessage,
          assistantMessage,
        ]);
        return newCache;
      });

      let finalTradeIds = tradeIds;
      if (
        !finalTradeIds &&
        chatTradesContext &&
        chatTradesContext.chatId === activeChatId
      ) {
        finalTradeIds = chatTradesContext.tradeIds;
      }

      let ymNewsSummarySent = false;

      try {
        const result = await sendMessageMutation.mutateAsync({
          chatId: activeChatId,
          content: message,
          cardIds: cardIds,
          tradeIds: finalTradeIds,
          fileIds: fileIds,
          linkUrls: linkUrls,
          boardId: boardId || undefined,
          model: model,
          settings: settings,
          abortSignal: abortControllerRef.current?.signal,
          onChunk: (chunk: string) => {
            setMessagesCache((prev) => {
              const newCache = new Map(prev);
              const currentMessages = newCache.get(activeChatId) || [];
              const updatedMessages = currentMessages.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: chunk } : msg
              );
              newCache.set(activeChatId, updatedMessages);
              return newCache;
            });
          },
          onWarning: (message: string) => {
            showWarningToast(message);
          },
          onToolProgress: (progress) => {
            // Update tool progress - only keep latest status per tool type
            updateToolProgress(progress.type, progress);

            const meta = progress.meta;
            const isChatNewsSummary =
              meta?.[YM_CHAT_TOOL_PROGRESS_META.CHAT_NEWS_SUMMARY] === true;
            const isNewsFeedWidgetCreated =
              meta?.[YM_CHAT_TOOL_PROGRESS_META.NEWS_FEED_WIDGET_CREATED] ===
              true;

            if (
              progress.status === 'done' &&
              isChatNewsSummary &&
              !ymNewsSummarySent
            ) {
              ymNewsSummarySent = true;
              trackEvent('ai_tool_news_activated', { chat_id: activeChatId });
            }

            if (
              progress.status === 'done' &&
              progress.type === 'create_card' &&
              isNewsFeedWidgetCreated
            ) {
              const bid = meta?.[YM_CHAT_TOOL_PROGRESS_META.BOARD_ID];
              if (typeof bid === 'number') {
                trackEvent('ai_tool_news_widget_added', {
                  chat_id: activeChatId,
                  board_id: bid,
                });
              }
            }

            if (progress.type === 'create_card' && progress.status === 'done') {
              const createdCard = progress?.meta?.card as Card | undefined;
              if (
                boardId &&
                createdCard?.id &&
                createdCard?.boardId === boardId
              ) {
                queryClient.setQueryData(
                  boardQueryKeys.boardFull(boardId),
                  (prev: BoardFullData | undefined) => {
                    if (!prev || !Array.isArray(prev.cards)) return prev;
                    const exists = prev.cards.some(
                      (c: Card) => c?.id === createdCard.id
                    );
                    if (exists) return prev;
                    return {
                      ...prev,
                      cards: [...prev.cards, createdCard],
                    };
                  }
                );
                // Edges might also be affected by some tools; keep a light invalidation for edges only.
                queryClient.invalidateQueries({
                  queryKey: boardQueryKeys.edges(),
                });
              } else if (boardId) {
                // Backward compatible fallback
                queryClient.invalidateQueries({
                  queryKey: boardQueryKeys.boardFull(boardId),
                });
                queryClient.invalidateQueries({
                  queryKey: boardQueryKeys.edges(),
                });
              }
              onRefreshBoardRef.current?.();
            }

            if (
              progress.type === 'create_board' &&
              progress.status === 'done'
            ) {
              queryClient.invalidateQueries({
                queryKey: boardQueryKeys.boards(),
              });
            }
          },
        });

        if (result?.assistantMessage) {
          trackEvent('ai_response_received', {
            chat_id: activeChatId,
            length: result.assistantMessage.content?.length ?? 0,
          });
        }

        if (result?.userMessage && result?.assistantMessage) {
          setMessagesCache((prev) => {
            const newCache = new Map(prev);
            const currentMessages = newCache.get(activeChatId) || [];
            const updatedMessages = currentMessages.map((msg) => {
              if (msg.id === userMessage.id) {
                return result.userMessage;
              }
              if (msg.id === assistantMessageId) {
                return result.assistantMessage;
              }
              return msg;
            });
            newCache.set(activeChatId, updatedMessages);
            return newCache;
          });
        }

        setContextCards([]);
        clearToolProgress();
        removeChatContextCards(activeChatId);

        if (chatTradesContext && chatTradesContext.chatId === activeChatId) {
          removeAllTrades();
        }

        abortControllerRef.current = null;

        handleNotify(t('manager.messageSent'), 'success');
      } catch (error) {
        if (error instanceof Error && error.message === 'ABORTED') {
          // Keep the partial message in cache for user to see what was generated
          clearToolProgress();
          abortControllerRef.current = null;
          return; // Don't show error notification, already shown in handleStopGeneration
        }

        logger.error(
          'ChatManager',
          'Error sending message, attempting resume',
          error
        );
        abortControllerRef.current = null;

        // Try to resume from checkpoint before giving up
        const resumed = await attemptResume(activeChatId);
        if (resumed) {
          clearToolProgress();
          removeChatContextCards(activeChatId);
          setContextCards([]);
          return;
        }

        // Resume failed — fall back to original behavior
        handleNotify(
          error instanceof Error ? error.message : t('manager.messageError'),
          'error'
        );
        clearToolProgress();
        removeChatContextCards(activeChatId);
        setContextCards([]);
        setMessagesCache((prev) => {
          const newCache = new Map(prev);
          const currentMessages = newCache.get(activeChatId) || [];
          newCache.set(
            activeChatId,
            currentMessages.filter((msg) => msg.id !== assistantMessageId)
          );
          return newCache;
        });
        await refetchMessagesRef.current();
      }
    },
    [
      activeChatId,
      activeChatType,
      executePipeline,
      sendMessageMutation,
      handleNotify,
      chatTradesContext,
      removeAllTrades,
      boardId,
      queryClient,
      removeChatContextCards,
      clearToolProgress,
      updateToolProgress,
      attemptResume,
      trackEvent,
      t,
      setMessagesCache,
      refetchMessagesRef,
      onRefreshBoardRef,
      setContextCards,
    ]
  );

  return {
    handleSendMessage,
    handleStopGeneration,
    isResuming,
    attemptResume,
  };
}

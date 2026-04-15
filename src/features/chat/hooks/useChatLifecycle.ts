import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import {
  useChatsQuery,
  useChatQuery,
  useCreateChatMutation,
  useDeleteChatMutation,
} from '@/features/chat/queries';
import { ChatListItem, ChatType, Message } from '@/types';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';

interface UseChatLifecycleParams {
  activeChatId: number | null;
  activeChatType: string;
  setActiveChatId: (id: number | null, type?: ChatType) => void;
  openSidebar: () => void;
  removeChatContextCards: (chatId: number) => void;
  handleNotify: (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  setMessagesCache: React.Dispatch<
    React.SetStateAction<Map<number, Message[]>>
  >;
  isPipelineExecuting: boolean;
  resumePipeline: (chatId: number) => Promise<boolean>;
  attemptResume: (chatId: number) => Promise<boolean>;
  clearToolProgress: () => void;
}

export function useChatLifecycle({
  activeChatId,
  activeChatType,
  setActiveChatId,
  openSidebar,
  removeChatContextCards,
  handleNotify,
  setMessagesCache,
  isPipelineExecuting,
  resumePipeline,
  attemptResume,
  clearToolProgress,
}: UseChatLifecycleParams) {
  const { t } = useTranslation('chat');
  const { trackEvent } = useYandexMetrika();

  const {
    data: chatDetail,
    refetch: refetchMessages,
    isError: isMessagesError,
  } = useChatQuery(activeChatId, true);

  const messages = useMemo(
    () => chatDetail?.messages || [],
    [chatDetail?.messages]
  );

  const {
    data: chatList = [],
    isLoading: isChatsLoading,
    isError: _isChatsError,
  } = useChatsQuery();

  const createChatMutation = useCreateChatMutation();
  const deleteChatMutation = useDeleteChatMutation();

  // Track if initial chat selection/creation has occurred
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (activeChatId) {
      hasInitialized.current = true;
    }
  }, [activeChatId]);

  // Sync server messages into messagesCache
  useEffect(() => {
    if (activeChatId && messages && messages.length > 0) {
      setMessagesCache((prev) => {
        const cached = prev.get(activeChatId);
        // Only update if messages actually changed
        if (
          cached &&
          cached.length === messages.length &&
          cached[cached.length - 1]?.id === messages[messages.length - 1]?.id
        ) {
          return prev;
        }
        return new Map(prev).set(activeChatId, messages);
      });
    }
  }, [activeChatId, messages, setMessagesCache]);

  // Sync chat type from server response
  useEffect(() => {
    if (chatDetail && activeChatId) {
      const serverType = chatDetail.type || 'chat';
      if (activeChatType !== serverType) {
        setActiveChatId(activeChatId, serverType);
      }
    }
  }, [chatDetail, activeChatId, activeChatType, setActiveChatId]);

  // Clear activeChatId if messages query fails (chat doesn't exist or no access)
  // Don't reset hasInitialized — prevents infinite loop re-selecting the same broken chat
  useEffect(() => {
    if (isMessagesError && activeChatId) {
      setActiveChatId(null);
    }
  }, [isMessagesError, activeChatId, setActiveChatId]);

  // Initialize chat on user login: select the most recent chat from the list
  const chatAutoInitDone = useChatStore((s) => s.chatAutoInitDone);
  const setChatAutoInitDone = useChatStore((s) => s.setChatAutoInitDone);
  useEffect(() => {
    if (chatAutoInitDone || hasInitialized.current) return;

    if (isChatsLoading || activeChatId) return;

    try {
      if (localStorage.getItem('welcome_seed_chat_payload')) return;
    } catch {
      // ignore
    }

    // If user has chats, set the most recent one as active
    // Backend returns chats sorted by last_message_at DESC (most recent first)
    if (chatList.length > 0) {
      setActiveChatId(chatList[0].id, chatList[0].type || 'chat');
      hasInitialized.current = true;
      setChatAutoInitDone(true);
    }
  }, [
    isChatsLoading,
    activeChatId,
    chatList,
    setActiveChatId,
    chatAutoInitDone,
    setChatAutoInitDone,
  ]);

  // On chat activation (covers chat switch and browser refresh),
  // check if there's an active session to resume.
  // For pipeline chats, use pipeline-specific resume only if pipeline is not already executing.
  const pipelineResumeInFlightRef = useRef(false);
  useEffect(() => {
    if (!activeChatId) return;
    if (activeChatType === 'pipeline') {
      if (pipelineResumeInFlightRef.current || isPipelineExecuting) return;
      pipelineResumeInFlightRef.current = true;
      resumePipeline(activeChatId)
        .then(() => {
          // After resume completes (SSE stream ended), clear cache and refresh
          // messages from DB to show the final analysis text.
          if (activeChatId) {
            setMessagesCache((prev) => {
              const next = new Map(prev);
              next.delete(activeChatId);
              return next;
            });
          }
          refetchMessages();
        })
        .finally(() => {
          pipelineResumeInFlightRef.current = false;
        });
    } else {
      attemptResume(activeChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, activeChatType]);

  const handleChatSelect = useCallback(
    (chatId: number) => {
      const chat = chatList.find((c: ChatListItem) => c.id === chatId);
      setActiveChatId(chatId, chat?.type || 'chat');
    },
    [setActiveChatId, chatList]
  );

  const handleDeleteChat = useCallback(
    async (chatId: number) => {
      try {
        await deleteChatMutation.mutateAsync(chatId);
        if (activeChatId === chatId) {
          setActiveChatId(null);
        }
        removeChatContextCards(chatId);
        handleNotify(t('manager.chatDeleted'), 'success');
      } catch (error) {
        logger.error('ChatManager', 'Error deleting chat', error);
        handleNotify(t('manager.chatDeleteError'), 'error');
      }
    },
    [
      deleteChatMutation,
      activeChatId,
      setActiveChatId,
      removeChatContextCards,
      handleNotify,
      t,
    ]
  );

  const handleNewChat = useCallback(async () => {
    try {
      const chat = await createChatMutation.mutateAsync({
        name: t('manager.newChat'),
        systemPromptId: 'default',
      });

      // Track chat_create event
      trackEvent('chat_create', {
        chat_id: chat.id,
      });

      setActiveChatId(chat.id, chat.type || 'chat');
      handleNotify(t('manager.newChatCreated'), 'success');
    } catch (error) {
      logger.error('ChatManager', 'Error creating new chat', error);
      handleNotify(t('manager.newChatError'), 'error');
    }
  }, [createChatMutation, setActiveChatId, handleNotify, trackEvent, t]);

  const handleNewAnalysis = useCallback(async () => {
    try {
      const chat = await createChatMutation.mutateAsync({
        name: t('manager.newAnalysis'),
        type: 'pipeline',
      });

      trackEvent('chat_create', { chat_id: chat.id });
      setActiveChatId(chat.id, 'pipeline');
      handleNotify(t('manager.analysisCreated'), 'success');
    } catch (error) {
      logger.error('ChatManager', 'Error creating analysis chat', error);
      handleNotify(t('manager.analysisError'), 'error');
    }
  }, [createChatMutation, setActiveChatId, handleNotify, trackEvent, t]);

  const handleCloseChat = useCallback(() => {
    setActiveChatId(null);
    openSidebar();
  }, [setActiveChatId, openSidebar]);

  // Callback to refresh messages after survey/welcome ack actions
  const handleMessagesUpdated = useCallback(() => {
    refetchMessages();
  }, [refetchMessages]);

  return {
    messages,
    refetchMessages,
    handleChatSelect,
    handleDeleteChat,
    handleNewChat,
    handleNewAnalysis,
    handleCloseChat,
    handleMessagesUpdated,
  };
}

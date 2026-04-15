import {
  DEFAULT_VIEWPORT,
  getViewportCenter,
} from '@/features/board/utils/viewportUtils';
import {
  usePositionedCreateCardMutation,
  useHomeBoardQuery,
} from '@/features/board/queries';
import { chatQueryKeys } from '@/features/chat/queries';
import { useTranslation } from '@/shared/i18n/client';
import { chatApi } from '@/services/api/chat';
import { currentBoard } from '@/services/api/client';
import { useBoardStore } from '@/stores/boardStore';
import { useChatStore } from '@/stores/chatStore';
import { CreateCardRequest } from '@/types';
import { logger } from '@/shared/utils/logger';
import { showErrorToast } from '@/shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const WELCOME_FLOW_MAX_RETRIES = 3;
const WELCOME_FLOW_RETRY_KEY = 'welcome_seed_chat_retry_count';

/**
 * Hook to handle the welcome-to-auth flow:
 * - Creates seeded chat from welcome page conversation
 * - Creates a card on the user's board with the Q&A
 * - Navigates to the board
 * - Opens the chat sidebar
 *
 * This hook should be called from AppLayout to run once after authentication.
 */
export const useWelcomeFlowHandler = () => {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openSidebar, setActiveChatId } = useChatStore();
  const { boardId, viewport } = useBoardStore();
  const { data: homeBoard } = useHomeBoardQuery();
  const createCardMutation = usePositionedCreateCardMutation();

  const [isProcessing, setIsProcessing] = useState(false);

  const hasAttempted = useRef(false);

  const viewportCenter = getViewportCenter(viewport ?? DEFAULT_VIEWPORT);

  useEffect(() => {
    if (hasAttempted.current) return;

    let payloadRaw: string | null = null;
    try {
      payloadRaw = localStorage.getItem('welcome_seed_chat_payload');
    } catch {
      payloadRaw = null;
    }
    if (!payloadRaw) return;

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      localStorage.removeItem('welcome_seed_chat_payload');
      return;
    }

    const shouldCreateCard = payload.create_card === true;
    const effectiveBoardId = boardId ?? currentBoard.getId() ?? homeBoard?.id;

    if (shouldCreateCard && !effectiveBoardId) {
      return;
    }

    hasAttempted.current = true;
    setIsProcessing(true);

    const run = async () => {
      openSidebar();

      const preview = String(payload.preview || '');

      const chat = await chatApi.createChat({
        name: (payload.name as string) || t('manager.newChat'),
        systemPromptId: (payload.system_prompt_id as string) || 'default',
        seedMessages: Array.isArray(payload.seed_messages)
          ? payload.seed_messages
          : undefined,
      });

      try {
        localStorage.setItem(
          `chat_${chat.id}_welcome_migration`,
          JSON.stringify({ preview, collapsed: true, ack: false })
        );
      } catch {
        // ignore
      }

      if (shouldCreateCard && effectiveBoardId) {
        try {
          const cardTitle = String(payload.card_title || '');
          const cardContent = String(payload.card_content || '');

          if (cardTitle && cardContent) {
            const cardData: CreateCardRequest = {
              boardId: effectiveBoardId,
              title: cardTitle,
              type: 'ai_response',
              content: cardContent,
              x: viewportCenter.x,
              y: viewportCenter.y,
              zIndex: 0,
              meta: {
                ai_node_id: chat.id,
                is_ai_response: true,
                from_welcome_flow: true,
                timestamp: new Date().toISOString(),
              },
            };

            await createCardMutation.mutateAsync(cardData);
            logger.info(
              'useWelcomeFlowHandler',
              'Created welcome card on board',
              { boardId: effectiveBoardId, chatId: chat.id }
            );

            if (!boardId && effectiveBoardId) {
              router.push(`/ideas/${effectiveBoardId}`);
            }
          }
        } catch (cardError) {
          logger.error(
            'useWelcomeFlowHandler',
            'Error creating welcome card',
            cardError
          );
        }
      }

      try {
        localStorage.removeItem('welcome_seed_chat_payload');
        localStorage.removeItem('welcome_pending_message');
        localStorage.removeItem('welcome_message_count');
        localStorage.removeItem(WELCOME_FLOW_RETRY_KEY);
      } catch {
        // ignore
      }

      setActiveChatId(chat.id);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.chatMessages(chat.id),
      });
    };

    run()
      .catch((e) => {
        logger.error(
          'useWelcomeFlowHandler',
          'Error creating welcome seeded chat',
          e
        );

        let retryCount = 0;
        try {
          retryCount = parseInt(
            localStorage.getItem(WELCOME_FLOW_RETRY_KEY) || '0',
            10
          );
          if (isNaN(retryCount)) retryCount = 0;
        } catch {
          // ignore
        }

        retryCount += 1;

        if (retryCount >= WELCOME_FLOW_MAX_RETRIES) {
          logger.warn(
            'useWelcomeFlowHandler',
            `Giving up after ${retryCount} failed attempts, clearing stale payload`
          );
          try {
            localStorage.removeItem('welcome_seed_chat_payload');
            localStorage.removeItem('welcome_pending_message');
            localStorage.removeItem('welcome_message_count');
            localStorage.removeItem(WELCOME_FLOW_RETRY_KEY);
          } catch {
            // ignore
          }
        } else {
          try {
            localStorage.setItem(WELCOME_FLOW_RETRY_KEY, String(retryCount));
          } catch {
            // ignore
          }
          hasAttempted.current = false;
        }

        showErrorToast(t('welcome.chatCreationError'));
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [
    t,
    openSidebar,
    queryClient,
    setActiveChatId,
    boardId,
    homeBoard,
    viewportCenter,
    createCardMutation,
    router,
  ]);

  return { isProcessing };
};

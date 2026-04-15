import { useTranslation } from '@/shared/i18n/client';
import { cardsApi } from '@/services/api/cards';
import { useAuthStore } from '@/stores/authStore';
import { useBoardStore } from '@/stores/boardStore';
import { logger } from '@/shared/utils/logger';
import { showSignalToast } from '@/shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { refreshAccessToken } from '@/services/api/tokenRefresh';
import { useEffect, useRef } from 'react';

interface SignalReceivedEvent {
  signalWebhookId: number;
  cardId: number;
  boardId: number;
  description?: string;
  payload: Record<string, unknown>;
  securityId?: number;
  createdAt: string;
  showToastNotification?: boolean;
}

/**
 * Hook for SSE (Server-Sent Events) connection to receive real-time signal notifications
 *
 * Uses fetch() API instead of EventSource to support Authorization header.
 * Automatically:
 * - Connects to SSE stream on mount
 * - Reconnects when access token is refreshed
 * - Reconnects on 401 errors (expired token)
 * - Updates card cache if user is on board page
 * - Shows toast notification with signal info
 * - Maintains connection across page navigation (no reconnection needed)
 */
export const useSignalSSE = () => {
  const { t } = useTranslation('board');
  const tRef = useRef(t);
  tRef.current = t;
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    reconnectAttemptsRef.current = 0;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        const sseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signal/stream`;

        const response = await fetch(sseUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'text/event-stream',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired — trigger refresh. On success, accessToken in store updates,
            // which triggers useEffect re-run and reconnects with the fresh token.
            void refreshAccessToken();
            return;
          }
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        reconnectAttemptsRef.current = 0;

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEventType = 'message';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEventType = line.slice(6).trim();
              continue;
            }

            if (line.trim() === '' || line.startsWith(':')) {
              continue;
            }

            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();

              try {
                const parsed: SignalReceivedEvent = JSON.parse(data);

                if (currentEventType === 'signal_received') {
                  const toastTitle =
                    parsed.description ||
                    tRef.current('signalConstants.newSignal');
                  const toastMessage =
                    (parsed.payload.text as string) ||
                    (parsed.payload.message as string) ||
                    '';

                  const ticker = parsed.payload.ticker as string | undefined;
                  const securityId = parsed.securityId;
                  const toastContent = toastMessage
                    ? `${toastMessage}`
                    : toastTitle;

                  queryClient.invalidateQueries({
                    queryKey: ['signalHistory', parsed.signalWebhookId],
                  });

                  cardsApi
                    .getCard(parsed.cardId)
                    .then((updatedCard) => {
                      const { setNodes, setAllCards } =
                        useBoardStore.getState();

                      const nodeId = `card-${updatedCard.id}`;

                      setNodes((prevNodes) =>
                        prevNodes.map((node) => {
                          if (node.id === nodeId) {
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                ...updatedCard,
                                dimensions: node.data.dimensions,
                              },
                            };
                          }
                          return node;
                        })
                      );

                      const currentCards = useBoardStore.getState().allCards;
                      setAllCards(
                        currentCards.map((card) =>
                          card.id === updatedCard.id ? updatedCard : card
                        )
                      );
                    })
                    .catch((error) => {
                      logger.error(
                        'useSignalSSE',
                        'Failed to fetch updated card',
                        error
                      );
                    });

                  if (parsed.showToastNotification !== false) {
                    const boardUrl = `/ideas/${parsed.boardId}?cardId=${parsed.cardId}`;

                    showSignalToast({
                      source: 'tradingview',
                      messageTicker: ticker
                        ? { ticker, securityId }
                        : undefined,
                      message: toastContent,
                      button: {
                        text: tRef.current('sseSignal.goToCard'),
                        link: boardUrl,
                      },
                      duration: 6000,
                    });
                  }
                }

                currentEventType = 'message';
              } catch {
                // Invalid SSE data, skip
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!abortController.signal.aborted) {
              connectSSE();
            }
          }, delay);
        }
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, queryClient]);
};

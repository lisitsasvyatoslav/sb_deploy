import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { useChatStore } from '@/stores/chatStore';
import { Card } from '@/types';
import { logger } from '@/shared/utils/logger';

interface UseChatWindowLlmActionsParams {
  cards: Card[];
  effectiveShowLlmActions: boolean;
  showAuthNotice: boolean;
  minimal: boolean;
}

export function useChatWindowLlmActions({
  cards,
  effectiveShowLlmActions,
  showAuthNotice,
  minimal,
}: UseChatWindowLlmActionsParams) {
  const { t } = useTranslation('chat');
  const saveResponseAsCardFn = useChatStore((s) => s.saveResponseAsCard);
  const setLlmActions = useChatStore((s) => s.setLlmActions);

  const buildCardTitle = useCallback(
    (prompt?: string | null, fallback?: string) => {
      const source =
        (prompt && prompt.trim()) ||
        (fallback && fallback.trim()) ||
        t('aiResponse');
      return source.length > 80 ? `${source.slice(0, 80)}...` : source;
    },
    [t]
  );

  const handleSaveResponseAsCard = useCallback(
    async (messageId: number, prompt: string | null, response: string) => {
      if (!saveResponseAsCardFn) return;
      const title = buildCardTitle(prompt, response);
      try {
        await saveResponseAsCardFn(
          messageId,
          title,
          response,
          cards.map((c) => c.id)
        );
      } catch (error) {
        logger.error('ChatWindow', 'Save response as card error', error);
      }
    },
    [saveResponseAsCardFn, buildCardTitle, cards]
  );

  const handleCopyResponse = useCallback(
    (_messageId: number, content: string) => {
      navigator.clipboard.writeText(content).catch((err) => {
        logger.error('ChatWindow', 'Failed to copy', err);
      });
    },
    []
  );

  const handleThumbsUp = useCallback((_messageId: number) => {
    // TODO: Implement thumbs up feedback logic
  }, []);

  const handleThumbsDown = useCallback((_messageId: number) => {
    // TODO: Implement thumbs down feedback logic
  }, []);

  const handleRefreshResponse = useCallback((_messageId: number) => {
    // TODO: Implement regenerate response logic
  }, []);

  const llmActionsValue = useMemo(
    () => ({
      onThumbsUp: effectiveShowLlmActions ? handleThumbsUp : null,
      onThumbsDown: effectiveShowLlmActions ? handleThumbsDown : null,
      onCopy: effectiveShowLlmActions ? handleCopyResponse : null,
      onRefresh: effectiveShowLlmActions ? handleRefreshResponse : null,
      onAddToBoard: effectiveShowLlmActions ? handleSaveResponseAsCard : null,
      showActions: effectiveShowLlmActions && !showAuthNotice,
      showEditToggle: !minimal,
    }),
    [
      effectiveShowLlmActions,
      showAuthNotice,
      handleThumbsUp,
      handleThumbsDown,
      handleCopyResponse,
      handleRefreshResponse,
      handleSaveResponseAsCard,
      minimal,
    ]
  );

  useEffect(() => {
    setLlmActions(llmActionsValue);
    return () =>
      setLlmActions({
        onThumbsUp: null,
        onThumbsDown: null,
        onCopy: null,
        onRefresh: null,
        onAddToBoard: null,
        showActions: true,
        showEditToggle: true,
      });
  }, [setLlmActions, llmActionsValue]);

  return { llmActionsValue };
}

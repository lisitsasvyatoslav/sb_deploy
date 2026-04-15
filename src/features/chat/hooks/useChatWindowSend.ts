import { Dispatch, SetStateAction, useCallback } from 'react';
import { InlineChipData } from '@/features/chat/components/InlineChip';
import { Card } from '@/types';
import { ChipSyncRefs } from '@/features/chat/hooks/useChatWindowChipSync';
import type { YMGoal, YMEventParams } from '@/shared/hooks/useYandexMetrika';

interface FileAttachment {
  id: string | number;
  type: string;
  name: string;
  mimeType?: string;
  fileSize?: number;
  previewUrl?: string;
}

interface UseChatWindowSendParams {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  inlineChips: InlineChipData[];
  setInlineChips: Dispatch<SetStateAction<InlineChipData[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  cards: Card[];
  attachedFiles: FileAttachment[];
  attachedTrades: { ticker: string; securityId?: number }[];
  onSendMessage:
    | ((
        message: string,
        contextCards: number[],
        fileIds?: string[],
        model?: string,
        settings?: { maxTokens?: number | null; temperature?: number | null },
        tradeIds?: number[],
        linkUrls?: string[]
      ) => Promise<void>)
    | null
    | undefined;
  selectedModel: string;
  modelSettings: { maxTokens: number | null; temperature: number | null };
  getUploadedFileIds: () => string[];
  clearAttachedFiles: () => void;
  trackEvent: (goal: YMGoal, params?: YMEventParams) => void;
  chatId: number;
  isWelcomeMigrationActive: boolean;
  isWelcomeAcked: boolean;
  surveyPhase: string;
  markSurveyCompleted: () => void;
  isStrategyCatalogEnabled: boolean;
  checkSurveyTrigger: (message: string) => Promise<boolean>;
  trackMessageAndCheckReminder: () => void;
  chipSyncRefs: ChipSyncRefs;
}

interface UseChatWindowSendReturn {
  handleSendMessage: () => Promise<void>;
  handleSendSuggestion: (text: string) => Promise<void>;
  isInputDisabledByLoading: boolean;
}

export function useChatWindowSend({
  message,
  setMessage,
  inlineChips,
  setInlineChips,
  isLoading,
  setIsLoading,
  cards,
  attachedFiles,
  attachedTrades,
  onSendMessage,
  selectedModel,
  modelSettings,
  getUploadedFileIds,
  clearAttachedFiles,
  trackEvent,
  chatId,
  isWelcomeMigrationActive,
  isWelcomeAcked,
  surveyPhase,
  markSurveyCompleted,
  isStrategyCatalogEnabled,
  checkSurveyTrigger,
  trackMessageAndCheckReminder,
  chipSyncRefs,
}: UseChatWindowSendParams): UseChatWindowSendReturn {
  const handleSendMessage = useCallback(async () => {
    if (
      (!message.trim() &&
        attachedFiles.length === 0 &&
        attachedTrades.length === 0 &&
        inlineChips.length === 0) ||
      isLoading
    )
      return;

    if (isWelcomeMigrationActive && !isWelcomeAcked) return;

    if (surveyPhase === 'blocked') return;
    if (surveyPhase === 'prompt' || surveyPhase === 'optional') {
      markSurveyCompleted();
    }

    if (isStrategyCatalogEnabled) {
      const triggered = await checkSurveyTrigger(message.trim());
      if (triggered) {
        setMessage('');
        return;
      }
    }

    const inlineCardIds = inlineChips
      .filter((chip) => chip.type === 'card')
      .map((chip) => parseInt(chip.id.replace('card-', ''), 10))
      .filter((id) => !isNaN(id));

    const contextCards = [
      ...new Set([...cards.map((card) => card.id), ...inlineCardIds]),
    ];
    const fileIds = getUploadedFileIds();

    const linkUrls = inlineChips
      .filter((chip) => chip.type === 'link')
      .map((chip) => chip.url)
      .filter((url): url is string => Boolean(url));

    setIsLoading(true);
    const messageText = message.trim();

    setMessage('');
    setInlineChips([]);
    chipSyncRefs.chipifiedFileIdsRef.current.clear();
    chipSyncRefs.chipifiedCardIdsRef.current.clear();

    try {
      // Pass undefined for tradeIds so ChatManager reads them from context
      await onSendMessage?.(
        messageText,
        contextCards,
        fileIds,
        selectedModel,
        modelSettings,
        undefined,
        linkUrls
      );

      trackEvent('chat_send_message', {
        chat_id: chatId,
        length: messageText.length,
      });

      trackMessageAndCheckReminder();
      clearAttachedFiles();
    } catch (_error) {
      // Send errors are handled by the store/callback
    } finally {
      setIsLoading(false);
    }
  }, [
    message,
    attachedFiles,
    attachedTrades,
    inlineChips,
    isLoading,
    isWelcomeMigrationActive,
    isWelcomeAcked,
    surveyPhase,
    markSurveyCompleted,
    isStrategyCatalogEnabled,
    checkSurveyTrigger,
    cards,
    getUploadedFileIds,
    onSendMessage,
    selectedModel,
    modelSettings,
    trackEvent,
    chatId,
    trackMessageAndCheckReminder,
    clearAttachedFiles,
    setMessage,
    setInlineChips,
    setIsLoading,
    chipSyncRefs,
  ]);

  const handleSendSuggestion = useCallback(
    async (text: string) => {
      const contextCards = cards.map((card) => card.id);
      setIsLoading(true);
      try {
        await onSendMessage?.(
          text,
          contextCards,
          [],
          selectedModel,
          modelSettings
        );
        trackEvent('chat_send_message');
      } finally {
        setIsLoading(false);
      }
    },
    [
      cards,
      onSendMessage,
      selectedModel,
      modelSettings,
      trackEvent,
      setIsLoading,
    ]
  );

  return {
    handleSendMessage,
    handleSendSuggestion,
    isInputDisabledByLoading: isLoading,
  };
}

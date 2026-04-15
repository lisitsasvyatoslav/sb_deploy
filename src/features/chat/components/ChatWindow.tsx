import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '@/shared/i18n/client';
import AuthNoticeBanner from '@/features/chat/components/AuthNoticeBanner';
import ChatInput, { ChatInputRef } from '@/features/chat/components/ChatInput';
import { InlineChipData } from '@/features/chat/components/InlineChip';
import ModelSettingsDialog from '@/features/chat/components/ModelSettingsDialog';
import { useAvailableModelsQuery } from '@/features/chat/queries';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { chatApi } from '@/services/api/chat';
import { useChatStore } from '@/stores/chatStore';
import { useChatAttachedTrades } from '@/features/chat/hooks/useChatAttachedTrades';
import { Card, Message } from '@/types';
import WelcomeMigrationBanner from '@/features/chat/components/chatWindow/WelcomeMigrationBanner';
import WelcomeAckCta from '@/features/chat/components/chatWindow/WelcomeAckCta';
import ChatMessageList from '@/features/chat/components/chatWindow/ChatMessageList';
import {
  findWelcomeAssistantMessageId,
  getDisplayMessages,
  getBannerMessages,
} from '@/features/chat/components/chatWindow/welcomeMigration';
import { useChatSurveyGate } from '@/features/chat/hooks/useChatSurveyGate';
import { useChatFileAttachments } from '@/features/chat/hooks/useChatFileAttachments';
import EmptyChat from '@/features/chat/components/EmptyChat';
import SurveyQuestion from '@/features/chat/components/chatWindow/SurveyQuestion';
import { useDevStrategyCatalog } from '@/shared/hooks/useDevStrategyCatalog';
import { useStrategySurvey } from '@/features/chat/hooks/useStrategySurvey';
import StrategySurveyManager from './chatWindow/strategySurvey/StrategySurveyManager';
import {
  GlowBorder,
  useGlowTarget,
  useOnboardingUIStore,
} from '@/features/onboarding';

import { useChatWindowChipSync } from '@/features/chat/hooks/useChatWindowChipSync';
import { useChatWindowSend } from '@/features/chat/hooks/useChatWindowSend';
import { useChatWindowAttachments } from '@/features/chat/hooks/useChatWindowAttachments';
import { useChatWindowLlmActions } from '@/features/chat/hooks/useChatWindowLlmActions';
import { useChatWindowWelcome } from '@/features/chat/hooks/useChatWindowWelcome';
import { useChatWindowAnimatedReveal } from '@/features/chat/hooks/useChatWindowAnimatedReveal';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  is_active: boolean;
  max_tokens?: number;
  context_window?: number;
}

interface ChatWindowProps {
  chatId: number;
  cards: Card[];
  messages: Message[];
  /** Optional prop-based sendMessage (for standalone/demo usage). Falls back to useChatStore. */
  onSendMessage?: (
    message: string,
    contextCards: number[],
    fileIds?: string[],
    model?: string,
    settings?: { maxTokens?: number | null; temperature?: number | null },
    tradeIds?: number[],
    linkUrls?: string[]
  ) => Promise<void>;
  /** Optional prop-based removeCard (for standalone/demo usage). Falls back to useChatStore. */
  onRemoveCard?: (cardId: number) => void;
  /** Currently selected model ID (controlled by ChatManager/ChatHeader) */
  selectedModel?: string;
  /** Callback when model changes (e.g. from ModelSettingsDialog) */
  onModelChange?: (modelId: string) => void;
  error?: string | null;
  /** Enable sequential message reveal animation (for welcome/demo mode) */
  animatedReveal?: boolean;
  /** Minimal mode - hides model settings, surveys, file attachments, etc. */
  minimal?: boolean;
  /** Override LLM action bar visibility (defaults to !minimal) */
  showLlmActions?: boolean;
  /** Show auth notice banner that slides up from under the input */
  showAuthNotice?: boolean;
  /** External loading state (e.g. DemoChat streaming) to supplement internal isLoading */
  isExternalLoading?: boolean;
  /** Chat type — 'chat' or 'pipeline' */
  chatType?: string;
  /** Live pipeline progress rendered inside the message area */
  pipelineProgress?: React.ReactNode;
  /** Hide DB pipeline plans when live progress is shown (prevent duplicates) */
  hidePipelinePlans?: boolean;
  /** Externally disable input (e.g. pipeline finished) */
  inputDisabled?: boolean;
  /** When true, the input-mode attachments list is open; changes trigger a panel refresh */
  isInputAttachmentsListOpen?: boolean;
  /** Callback to add a local (non-server) message to the chat, used by strategy survey mock flow */
  onAddLocalMessage?: (message: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  cards,
  messages,
  onSendMessage: onSendMessageProp,
  onRemoveCard: onRemoveCardProp,
  selectedModel: selectedModelProp = 'gpt-5-mini',
  onModelChange,
  error = null,
  animatedReveal = false,
  minimal = false,
  showLlmActions: showLlmActionsProp,
  showAuthNotice = false,
  isExternalLoading = false,
  chatType,
  pipelineProgress,
  hidePipelinePlans = false,
  inputDisabled = false,
  isInputAttachmentsListOpen = false,
  onAddLocalMessage,
}) => {
  const { t } = useTranslation('chat');
  const effectiveShowLlmActions = showLlmActionsProp ?? !minimal;
  const [message, setMessage] = useState('');
  const [inlineChips, setInlineChips] = useState<InlineChipData[]>([]);
  const chatInputRef = useRef<ChatInputRef>(null);
  const selectedModel = selectedModelProp;
  const [showModelSettings, setShowModelSettings] = useState(false);

  const storeSendMessage = useChatStore((s) => s.sendMessage);
  const storeRemoveCard = useChatStore((s) => s.removeCard);
  const onSendMessage = onSendMessageProp ?? storeSendMessage;
  const onRemoveCard = onRemoveCardProp ?? storeRemoveCard;
  const [modelSettings, setModelSettings] = useState({
    maxTokens: null as number | null,
    temperature: null as number | null,
  });

  const { trackEvent } = useYandexMetrika();
  const onMessagesUpdatedFn = useChatStore((s) => s.onMessagesUpdated);
  const { trades: attachedTrades } = useChatAttachedTrades();
  const isStrategyCatalogEnabled = useDevStrategyCatalog();
  const {
    showSurvey,
    currentStep: currentSurveyStep,
    surveyLoading,
    handleBack: handleSurveyBack,
    handleSubmit: handleSurveySubmit,
    checkTrigger: checkSurveyTrigger,
  } = useStrategySurvey({ chatId, onAddLocalMessage });
  const { data: models = [] } = useAvailableModelsQuery() as {
    data: AIModel[];
    isLoading: boolean;
    error: Error | null;
  };

  const selectedModelData = models.find((model) => model.id === selectedModel);

  const [isLoading, setIsLoading] = useState(false);
  // Reset loading on chat switch to unblock input from previous chat's in-flight stream (TD-998)
  useEffect(() => {
    setIsLoading(false);
  }, [chatId]);
  const effectiveIsLoading = isLoading || isExternalLoading;
  const [, setInputTokens] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tokenCountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Sub-hooks ---

  const { visibleMessageIndices } = useChatWindowAnimatedReveal({
    animatedReveal,
    messages,
  });

  const {
    attachedFiles,
    isUploadingFile,
    fileInputRef,
    handleAttachClick,
    handleFileSelect,
    handlePasteFile,
    handleRemoveFileAttachment,
    clearAttachedFiles,
    getUploadedFileIds,
    addExternalFile,
  } = useChatFileAttachments();

  const chipSyncRefs = useChatWindowChipSync({
    chatId,
    cards,
    inlineChips,
    setInlineChips,
    setMessage,
    chatInputRef,
    attachedFiles,
    handleRemoveFileAttachment,
    onRemoveCard,
    addExternalFile,
  });

  // Token count estimation
  useEffect(() => {
    if (minimal) return;

    if (tokenCountTimeoutRef.current) {
      clearTimeout(tokenCountTimeoutRef.current);
    }

    if (!message.trim() && attachedFiles.length === 0 && cards.length === 0) {
      setInputTokens(0);
      return;
    }

    tokenCountTimeoutRef.current = setTimeout(async () => {
      try {
        const modelId = selectedModel.split('/')[1] || 'gpt-4';
        const fileIds = attachedFiles
          .filter((f) => f.type === 'file')
          .map((f) => String(f.id));
        const cardIds = cards.map((c) => c.id);
        const result = await chatApi.estimateTokens(
          message,
          modelId,
          fileIds,
          cardIds
        );
        setInputTokens(result.totalTokens);
      } catch (_error) {
        setInputTokens(Math.ceil(message.length / 4));
      }
    }, 300);

    return () => {
      if (tokenCountTimeoutRef.current) {
        clearTimeout(tokenCountTimeoutRef.current);
      }
    };
  }, [message, selectedModel, minimal, attachedFiles, cards]);

  const {
    welcomeMigration,
    isWelcomeMigrationActive,
    isWelcomeCollapsed,
    isWelcomeAcked,
    handleToggleWelcomeCollapsed,
    handleWelcomeAck: handleWelcomeAckBase,
  } = useChatWindowWelcome({ chatId });

  const handleMessagesUpdated = useCallback(() => {
    onMessagesUpdatedFn?.();
  }, [onMessagesUpdatedFn]);

  const {
    surveyPhase,
    surveyQuestion,
    surveySelection,
    setSurveySelection,
    surveySubmitting,
    surveyProgress,
    submitSurveyAnswer,
    handleSurveySkip,
    markSurveyCompleted,
    createWelcomeAckMessage,
    trackMessageAndCheckReminder,
  } = useChatSurveyGate(
    chatId,
    chatType !== 'pipeline' && !(isWelcomeMigrationActive && !isWelcomeAcked),
    handleMessagesUpdated
  );

  // Bind welcome ack to survey gate's createWelcomeAckMessage
  const handleWelcomeAck = useCallback(async () => {
    await handleWelcomeAckBase(createWelcomeAckMessage);
  }, [handleWelcomeAckBase, createWelcomeAckMessage]);

  // Onboarding glow state
  const surveyGlow = useGlowTarget('survey');
  const chatInputGlow = useGlowTarget('chat-input');

  // Sync survey completion state into onboarding store for step locking
  useEffect(() => {
    const isBlocking = surveyPhase === 'blocked' || surveyPhase === 'loading';
    useOnboardingUIStore.getState().setSurveyCompleted(!isBlocking);
  }, [surveyPhase]);

  // Onboarding: auto-fill chat input when a pending message is set
  const pendingChatMessage = useOnboardingUIStore((s) => s.pendingChatMessage);
  useEffect(() => {
    if (pendingChatMessage) {
      setMessage(pendingChatMessage);
      useOnboardingUIStore.getState().setPendingChatMessage(null);
    }
  }, [pendingChatMessage]);

  // Onboarding: auto-check step when chat reply finishes streaming
  const prevLoadingRef = useRef(effectiveIsLoading);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = effectiveIsLoading;
    if (wasLoading && !effectiveIsLoading) {
      const store = useOnboardingUIStore.getState();
      if (store.awaitingReplyStepKey) {
        store.completeAwaitingStep();
      }
    }
  }, [effectiveIsLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'auto' });
    });

    return () => cancelAnimationFrame(scrollRafRef.current);
  }, [
    messages,
    effectiveIsLoading,
    surveyPhase,
    surveyQuestion,
    pipelineProgress,
  ]);

  const { handleRemoveAttachment, handleOpenInputAttachmentsList } =
    useChatWindowAttachments({
      inlineChips,
      setInlineChips,
      attachedFiles,
      attachedTrades,
      onRemoveCard,
      handleRemoveFileAttachment,
      isInputAttachmentsListOpen,
    });

  useChatWindowLlmActions({
    cards,
    effectiveShowLlmActions,
    showAuthNotice,
    minimal,
  });

  // Register attach file trigger in store for ChatHeader access
  const setAttachFileTrigger = useChatStore((s) => s.setAttachFileTrigger);
  useEffect(() => {
    if (!minimal) {
      setAttachFileTrigger(handleAttachClick);
      return () => setAttachFileTrigger(null);
    }
  }, [handleAttachClick, setAttachFileTrigger, minimal]);

  const { handleSendMessage, handleSendSuggestion } = useChatWindowSend({
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
  });

  // --- Derived state ---

  const getWelcomeAssistantMessageId = useMemo(() => {
    if (!isWelcomeMigrationActive) return null;
    return findWelcomeAssistantMessageId(messages);
  }, [isWelcomeMigrationActive, messages]);

  const bannerMessages = useMemo(() => {
    if (!isWelcomeMigrationActive) return [];
    return getBannerMessages(messages, getWelcomeAssistantMessageId);
  }, [isWelcomeMigrationActive, getWelcomeAssistantMessageId, messages]);

  const isSurveyBlocking =
    surveyPhase === 'loading' ||
    surveyPhase === 'blocked' ||
    surveyPhase === 'optional' ||
    surveyPhase === 'prompt' ||
    surveyPhase === 'reminder';
  const isWelcomeBlocking =
    isWelcomeMigrationActive && !isWelcomeAcked && bannerMessages.length > 0;
  const isInputDisabled =
    inputDisabled ||
    isLoading ||
    (!minimal &&
      (isUploadingFile ||
        surveySubmitting ||
        isSurveyBlocking ||
        isWelcomeBlocking));

  const displayMessages = useMemo(() => {
    let msgs = messages;
    if (isWelcomeMigrationActive) {
      msgs = getDisplayMessages(messages, getWelcomeAssistantMessageId);
    }

    if (animatedReveal) {
      return msgs.filter((_, index) => visibleMessageIndices.has(index));
    }

    return msgs;
  }, [
    messages,
    isWelcomeMigrationActive,
    getWelcomeAssistantMessageId,
    animatedReveal,
    visibleMessageIndices,
  ]);

  const surveyFooterNode = useMemo(() => {
    if (
      minimal ||
      !(
        surveyPhase === 'blocked' ||
        surveyPhase === 'optional' ||
        surveyPhase === 'prompt' ||
        surveyPhase === 'reminder'
      ) ||
      !surveyQuestion
    ) {
      return undefined;
    }
    return (
      <GlowBorder active={surveyGlow} borderRadius={4} borderWidth={3}>
        <SurveyQuestion
          question={surveyQuestion}
          selection={surveySelection}
          onSelectionChange={setSurveySelection}
          onSubmit={submitSurveyAnswer}
          onSkip={handleSurveySkip}
          submitting={surveySubmitting}
          progress={surveyPhase === 'blocked' ? surveyProgress : undefined}
        />
      </GlowBorder>
    );
  }, [
    minimal,
    surveyPhase,
    surveyQuestion,
    surveySelection,
    setSurveySelection,
    submitSurveyAnswer,
    handleSurveySkip,
    surveySubmitting,
    surveyProgress,
    surveyGlow,
  ]);

  const renderActions = useCallback(
    (messageId: number, _prompt: string | null, _response: string) => {
      if (minimal) return null;

      const showWelcomeAckCta =
        isWelcomeMigrationActive &&
        !isWelcomeAcked &&
        getWelcomeAssistantMessageId === messageId;
      if (!showWelcomeAckCta) return null;

      return (
        <div className="flex flex-col gap-3">
          <WelcomeAckCta
            onAck={handleWelcomeAck}
            disabled={effectiveIsLoading}
          />
        </div>
      );
    },
    [
      minimal,
      isWelcomeMigrationActive,
      isWelcomeAcked,
      getWelcomeAssistantMessageId,
      handleWelcomeAck,
      effectiveIsLoading,
    ]
  );

  // --- Render ---

  return (
    <>
      {error && (
        <div className="text-center py-4 text-status-negative px-4">
          <p className="text-sm text-status-negative">{error}</p>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto scrollbar-chat p-4 flex flex-col gap-6${
          messages.length === 0 && isSurveyBlocking ? ' justify-center' : ''
        }`}
      >
        {messages.length === 0 && !effectiveIsLoading && !isSurveyBlocking && (
          <EmptyChat
            chatType={chatType}
            onSendSuggestion={handleSendSuggestion}
            disabled={effectiveIsLoading || isWelcomeBlocking}
          />
        )}

        {!minimal && isWelcomeMigrationActive && bannerMessages.length > 0 && (
          <WelcomeMigrationBanner
            preview={welcomeMigration?.preview || ''}
            collapsed={isWelcomeCollapsed}
            seededMessages={bannerMessages}
            onToggle={handleToggleWelcomeCollapsed}
          />
        )}

        <div
          className={`flex-1 flex flex-col gap-6 min-h-0${
            messages.length === 0 && isSurveyBlocking ? ' justify-center' : ''
          }`}
        >
          <ChatMessageList
            scrollContainerRef={scrollContainerRef}
            messages={displayMessages}
            isLoading={effectiveIsLoading}
            renderActions={renderActions}
            surveyFooter={surveyFooterNode}
            pipelineProgress={pipelineProgress}
            hidePipelinePlans={hidePipelinePlans}
          />

          {!minimal && surveyPhase === 'loading' && (
            <div className="max-w-[520px] w-full text-center text-sm text-text-secondary animate-pulse">
              {t('loadingSurvey')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pt-3 pb-0">
        <AuthNoticeBanner show={showAuthNotice}>
          {isStrategyCatalogEnabled && showSurvey ? (
            <StrategySurveyManager
              key={currentSurveyStep}
              step={currentSurveyStep}
              onSubmit={handleSurveySubmit}
              onBack={handleSurveyBack}
              submitting={surveyLoading}
              showDisclaimer={!showAuthNotice}
            />
          ) : (
            <GlowBorder active={chatInputGlow} borderRadius={0} borderWidth={3}>
              <ChatInput
                ref={chatInputRef}
                value={message}
                onChange={setMessage}
                onSend={handleSendMessage}
                disabled={
                  minimal
                    ? effectiveIsLoading || showAuthNotice
                    : isInputDisabled
                }
                isLoading={effectiveIsLoading}
                placeholder={
                  chatType === 'pipeline'
                    ? t('input.analysisInstruction')
                    : t('input.askQuestion')
                }
                minimal={minimal}
                showDisclaimer={!showAuthNotice}
                onAttachClick={
                  minimal || chatType === 'pipeline'
                    ? undefined
                    : handleAttachClick
                }
                attachedFiles={minimal ? [] : attachedFiles}
                onRemoveAttachment={
                  minimal ? undefined : handleRemoveAttachment
                }
                onAttachmentsChipClick={
                  minimal ? undefined : handleOpenInputAttachmentsList
                }
                onPasteFile={minimal ? undefined : handlePasteFile}
                inlineChips={minimal ? [] : inlineChips}
                onInlineChipsChange={minimal ? undefined : setInlineChips}
              />
            </GlowBorder>
          )}
        </AuthNoticeBanner>

        {!minimal && cards.length >= 40 && (
          <p className="text-xs text-orange-500 mt-2 text-center">
            {t('cardLimitWarning', { count: cards.length })}
          </p>
        )}
      </div>

      {!minimal && (
        <ModelSettingsDialog
          open={showModelSettings}
          onClose={() => setShowModelSettings(false)}
          onSave={(settings, newModel) => {
            setModelSettings(settings);
            onModelChange?.(newModel);
            setShowModelSettings(false);
          }}
          currentSettings={modelSettings}
          selectedModel={selectedModel}
          modelData={selectedModelData}
          models={models}
        />
      )}

      {!minimal && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          aria-hidden="true"
          title="Upload file"
        />
      )}
    </>
  );
};

export default ChatWindow;

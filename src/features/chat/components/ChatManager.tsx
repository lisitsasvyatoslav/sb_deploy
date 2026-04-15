import {
  DEFAULT_VIEWPORT,
  getViewportCenter,
} from '@/features/board/utils/viewportUtils';
import ChatDropOverlay from '@/features/chat/components/ChatDropOverlay';
import ChatHeader from '@/features/chat/components/ChatHeader';
import ChatSidebar from '@/features/chat/components/ChatList';
import ChatWindow from '@/features/chat/components/ChatWindow';
import { usePipelineExecution } from '@/features/chat/hooks/usePipelineExecution';
import PipelineLiveProgress from '@/features/chat/components/pipeline/PipelineLiveProgress';
import { AttachmentListWindow } from '@/features/chat/components/Attachments';
import { useChatMessaging } from '@/features/chat/hooks/useChatMessaging';
import { useChatLifecycle } from '@/features/chat/hooks/useChatLifecycle';
import { useChatAttachmentsManager } from '@/features/chat/hooks/useChatAttachmentsManager';
import { useChatSaveCard } from '@/features/chat/hooks/useChatSaveCard';
import { useChatExpandedLayout } from '@/features/chat/hooks/useChatExpandedLayout';
import { useGlowTarget } from '@/features/onboarding';
import { useResizable } from '@/shared/hooks';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import { useBoardStore } from '@/stores/boardStore';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Message } from '@/types';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from '@/shared/utils/toast';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { m } from 'framer-motion';

export { useChatManager } from '@/features/chat/hooks/useChatManager';

// Highlight targets that map to elements rendered inside the chat panel.
// Hoisted to module scope so the array reference is stable across renders.
const CHAT_AREA_HIGHLIGHT_TARGETS = [
  'survey',
  'chat',
  'chat-input',
  'model-selector',
  'model-dropdown',
  'save-to-board',
];

interface ChatManagerProps {
  onRefreshBoard?: () => void;
}

export const ChatManager: React.FC<ChatManagerProps> = ({ onRefreshBoard }) => {
  // Reactive data — re-renders only when these values change
  const {
    isChatSidebarOpen,
    activeChatId,
    activeChatType,
    chatWidth,
    chatTradesContext,
    chatContextCards,
    isChatExpanded,
  } = useChatStore(
    useShallow((s) => ({
      isChatSidebarOpen: s.isChatSidebarOpen,
      activeChatId: s.activeChatId,
      activeChatType: s.activeChatType,
      chatWidth: s.chatWidth,
      chatTradesContext: s.chatTradesContext,
      chatContextCards: s.chatContextCards,
      isChatExpanded: s.isChatExpanded,
    }))
  );
  // Stable actions — references never change
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const openSidebar = useChatStore((s) => s.openSidebar);
  const setChatWidth = useChatStore((s) => s.setChatWidth);
  const removeChatContextCards = useChatStore((s) => s.removeChatContextCards);
  const setChatExpanded = useChatStore((s) => s.setChatExpanded);
  const updateToolProgress = useChatStore((s) => s.updateToolProgress);
  const clearToolProgress = useChatStore((s) => s.clearToolProgress);
  const setStopGeneration = useChatStore((s) => s.setStopGeneration);
  const setSendMessage = useChatStore((s) => s.setSendMessage);
  const setRemoveCard = useChatStore((s) => s.setRemoveCard);
  const setSaveResponseAsCard = useChatStore((s) => s.setSaveResponseAsCard);
  const setOnMessagesUpdated = useChatStore((s) => s.setOnMessagesUpdated);
  const setOpenAttachmentsList = useChatStore((s) => s.setOpenAttachmentsList);
  const attachFileTrigger = useChatStore((s) => s.attachFileTrigger);
  const isDragOverChat = useChatStore((s) => s.isDragOverChat);
  const selectedCardCount = useCardSelectionStore(
    (s) => s.selectedCards.length
  );
  const dragCardCount = isDragOverChat
    ? Math.max(selectedCardCount, 1)
    : selectedCardCount;
  const removeAllTrades = useChatStore((s) => s.removeAllTrades);
  const allCards = useBoardStore((s) => s.allCards);
  const boardId = useBoardStore((s) => s.boardId);
  const viewport = useBoardStore((s) => s.viewport);
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const sidebarWidth = isSidebarCollapsed
    ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
    : LAYOUT_CONSTANTS.SIDEBAR_EXPANDED_WIDTH;
  const { trackEvent } = useYandexMetrika();

  const lastYmAiChatOpenedRef = useRef<number | null>(null);
  useEffect(() => {
    if (activeChatId === null) {
      lastYmAiChatOpenedRef.current = null;
      return;
    }
    if (lastYmAiChatOpenedRef.current === activeChatId) return;
    lastYmAiChatOpenedRef.current = activeChatId;
    trackEvent('ai_chat_opened', { chat_id: activeChatId });
  }, [activeChatId, trackEvent]);

  const isAnalysisEnabled =
    process.env.NEXT_PUBLIC_SHOW_ANALYSIS === 'true' ||
    ['test', 'development'].includes(process.env.NODE_ENV);

  // Resizable functionality
  const { isResizing, handleMouseDown } = useResizable({
    initialWidth: chatWidth,
    minWidth: 308,
    maxWidth: 600,
    onResize: (newWidth) => {
      setChatWidth(newWidth);
    },
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat-selected-model') || 'gpt-5-mini';
    }
    return 'gpt-5-mini';
  });

  // Persist selected model to localStorage
  useEffect(() => {
    localStorage.setItem('chat-selected-model', selectedModel);
  }, [selectedModel]);

  // Clear stale tool progress when switching chats (TD-998)
  useEffect(() => {
    clearToolProgress();
  }, [activeChatId, clearToolProgress]);

  // Pipeline execution
  const {
    state: pipelineState,
    execute: executePipeline,
    resume: resumePipeline,
    stop: stopPipeline,
  } = usePipelineExecution();
  const isPipelineExecuting =
    pipelineState.status === 'summarizing_context' ||
    pipelineState.status === 'generating_plan' ||
    pipelineState.status === 'running';
  const pipelineSortedSteps = useMemo(() => {
    if (!pipelineState.plan) return [];
    return pipelineState.plan.steps.map((step) => ({
      ...step,
      ...pipelineState.stepStatuses[step.id],
    }));
  }, [pipelineState.plan, pipelineState.stepStatuses]);

  // When pipeline completes or fails (including after resume), refresh messages
  const prevPipelineStatusRef = useRef(pipelineState.status);

  const viewportCenter = useMemo(() => {
    return getViewportCenter(viewport ?? DEFAULT_VIEWPORT);
  }, [viewport]);

  // Stable ref so handleSaveResponseAsCard doesn't recreate on every viewport change
  const viewportCenterRef = useRef(viewportCenter);
  viewportCenterRef.current = viewportCenter;
  const onRefreshBoardRef = useRef(onRefreshBoard);
  onRefreshBoardRef.current = onRefreshBoard;

  // Core streaming state — lifted here so both messaging and lifecycle hooks can share it
  const [messagesCache, setMessagesCache] = useState<Map<number, Message[]>>(
    new Map()
  );

  // Forward ref for refetchMessages — resolved after useChatLifecycle call
  const refetchMessagesRef = useRef<() => Promise<unknown>>(() =>
    Promise.resolve()
  );

  // --- Shared utility ---

  const handleNotify = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
      switch (severity) {
        case 'success':
          showSuccessToast(message);
          break;
        case 'error':
          showErrorToast(message);
          break;
        case 'warning':
          showWarningToast(message);
          break;
        case 'info':
          showInfoToast(message);
          break;
      }
    },
    []
  );

  // --- Extracted hooks ---

  const {
    contextCards,
    setContextCards,
    loadContextCards,
    handleSaveResponseAsCard,
    handleRemoveCard,
  } = useChatSaveCard({
    activeChatId,
    boardId,
    allCards,
    chatContextCards,
    viewportCenterRef,
    onRefreshBoardRef,
    handleNotify,
  });

  const { handleSendMessage, handleStopGeneration, isResuming, attemptResume } =
    useChatMessaging({
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
    });

  const {
    messages,
    refetchMessages,
    handleChatSelect,
    handleDeleteChat,
    handleNewChat,
    handleNewAnalysis,
    handleCloseChat,
    handleMessagesUpdated,
  } = useChatLifecycle({
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
  });

  // Resolve the forward reference for refetchMessages
  refetchMessagesRef.current = refetchMessages;

  // Pipeline status change effect — refresh messages when pipeline completes
  useEffect(() => {
    const prev = prevPipelineStatusRef.current;
    prevPipelineStatusRef.current = pipelineState.status;
    if (
      (pipelineState.status === 'completed' ||
        pipelineState.status === 'failed') &&
      prev !== pipelineState.status
    ) {
      refetchMessages();
    }
  }, [pipelineState.status, refetchMessages]);

  // Load context cards effect
  useEffect(() => {
    loadContextCards();
  }, [loadContextCards]);

  const {
    showAttachmentsList,
    attachmentsListContext,
    handleOpenAttachmentsList,
    handleCloseAttachmentsList,
    handleDeleteAttachment,
  } = useChatAttachmentsManager();

  const showChatWindow = activeChatId !== null;

  const {
    isCollapsing,
    expandedViewportWidth,
    handleCollapseAnimationComplete,
    handleToggleExpand,
  } = useChatExpandedLayout({
    isChatExpanded,
    setChatExpanded,
    showChatWindow,
    sidebarWidth,
  });

  // Callback to add local message (for mock/survey responses)
  const handleAddLocalMessage = useCallback(
    (message: Message) => {
      if (!activeChatId) return;
      setMessagesCache((prev) => {
        const chatMessages = prev.get(activeChatId) || [];
        const next = new Map(prev);
        next.set(activeChatId, [...chatMessages, message]);
        return next;
      });
    },
    [activeChatId, setMessagesCache]
  );

  // Register callbacks in store so child components read them directly (no prop-drilling).
  // Use ref indirection so the useEffect runs only once (mount/unmount) —
  // prevents infinite loop: chatStore.set → ChatManager re-render → new callback ref → useEffect re-fires → chatStore.set …
  const handleSendMessageRef = useRef(handleSendMessage);
  handleSendMessageRef.current = handleSendMessage;
  const handleRemoveCardRef = useRef(handleRemoveCard);
  handleRemoveCardRef.current = handleRemoveCard;
  const handleSaveResponseAsCardRef = useRef(handleSaveResponseAsCard);
  handleSaveResponseAsCardRef.current = handleSaveResponseAsCard;
  const handleMessagesUpdatedRef = useRef(handleMessagesUpdated);
  handleMessagesUpdatedRef.current = handleMessagesUpdated;
  const handleOpenAttachmentsListRef = useRef(handleOpenAttachmentsList);
  handleOpenAttachmentsListRef.current = handleOpenAttachmentsList;

  useEffect(() => {
    const stableCallback: typeof handleSendMessage = (...args) =>
      handleSendMessageRef.current(...args);
    setSendMessage(stableCallback);
    return () => setSendMessage(null);
  }, [setSendMessage]);

  useEffect(() => {
    const stableCallback: typeof handleRemoveCard = (...args) =>
      handleRemoveCardRef.current(...args);
    setRemoveCard(stableCallback);
    return () => setRemoveCard(null);
  }, [setRemoveCard]);

  useEffect(() => {
    const stableCallback: typeof handleSaveResponseAsCard = (...args) =>
      handleSaveResponseAsCardRef.current(...args);
    setSaveResponseAsCard(stableCallback);
    return () => setSaveResponseAsCard(null);
  }, [setSaveResponseAsCard]);

  useEffect(() => {
    setOnMessagesUpdated((...args) =>
      handleMessagesUpdatedRef.current(...args)
    );
    return () => setOnMessagesUpdated(null);
  }, [setOnMessagesUpdated]);

  useEffect(() => {
    const stableCallback: typeof handleOpenAttachmentsList = (...args) =>
      handleOpenAttachmentsListRef.current(...args);
    setOpenAttachmentsList(stableCallback);
    return () => setOpenAttachmentsList(null);
  }, [setOpenAttachmentsList]);

  // Display computation
  const displayMessages = useMemo(
    () =>
      activeChatId ? messagesCache.get(activeChatId) || messages || [] : [],
    [activeChatId, messagesCache, messages]
  );
  const isDrawerOpen = isChatSidebarOpen || activeChatId !== null;
  const showSidebar = !showChatWindow && isChatSidebarOpen;

  // Pipeline progress UI rendered inside the message area
  const pipelineProgressContent = useMemo(
    () =>
      activeChatType === 'pipeline' ? (
        <PipelineLiveProgress
          status={pipelineState.status}
          error={pipelineState.error}
          steps={pipelineSortedSteps}
        />
      ) : undefined,
    [
      activeChatType,
      pipelineState.status,
      pipelineState.error,
      pipelineSortedSteps,
    ]
  );

  const effectiveWidth = isChatExpanded
    ? expandedViewportWidth
    : isDrawerOpen
      ? chatWidth
      : 0;
  const useFixedPosition = isChatExpanded || isCollapsing;

  // Keep the entire chat panel visible through the onboarding overlay
  // whenever the current step targets anything inside the chat area.
  const chatAreaHighlighted = useGlowTarget(CHAT_AREA_HIGHLIGHT_TARGETS);

  return (
    <m.div
      data-chat-drop-zone
      data-glow-container
      data-glow-active={chatAreaHighlighted || undefined}
      className={`flex-shrink-0 ${useFixedPosition ? `fixed top-0 bottom-0 right-0 z-50 ${isSidebarCollapsed ? 'left-[48px]' : 'left-[200px]'}` : 'relative z-50'}`}
      animate={{
        width: effectiveWidth,
      }}
      transition={
        isResizing
          ? { type: 'tween', duration: 0.06, ease: 'linear' }
          : { type: 'spring', stiffness: 420, damping: 44 }
      }
      onAnimationComplete={handleCollapseAnimationComplete}
    >
      {/* Sidebar */}
      <m.div
        className={`
          flex flex-col h-full
          ${isChatExpanded ? 'w-full' : ''}
          ${isDrawerOpen ? (isChatExpanded ? 'border-0' : 'border-r border-[var(--border-light)]') : 'border-0 pointer-events-none'}
          overflow-hidden
          bg-background-base
          relative
        `}
        animate={
          isChatExpanded
            ? { width: '100%', opacity: 1 }
            : {
                width: isDrawerOpen ? chatWidth : 0,
                opacity: isDrawerOpen ? 1 : 0,
              }
        }
        transition={
          isResizing
            ? { type: 'tween', duration: 0.06, ease: 'linear' }
            : { type: 'spring', stiffness: 420, damping: 44 }
        }
      >
        {/* Resize handle - right border (hidden when expanded) */}
        {isDrawerOpen && !isChatExpanded && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50"
          />
        )}
        {/* Drop overlay when dragging cards from board */}
        <ChatDropOverlay isVisible={isDragOverChat} cardCount={dragCardCount} />

        {/* Content when open */}
        {isDrawerOpen && (
          <>
            <ChatHeader
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onNewChat={handleNewChat}
              onNewAnalysis={isAnalysisEnabled ? handleNewAnalysis : undefined}
              onShowChatList={handleCloseChat}
              showAttachmentsList={showAttachmentsList}
              attachmentsCount={attachmentsListContext?.attachments.length ?? 0}
              onBackFromAttachments={handleCloseAttachmentsList}
              onAttachFile={attachFileTrigger ?? undefined}
              isExpanded={isChatExpanded}
              onToggleExpand={showChatWindow ? handleToggleExpand : undefined}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Attachments List Window - shown when viewing attachments */}
              {showAttachmentsList && attachmentsListContext && (
                <AttachmentListWindow
                  attachments={attachmentsListContext.attachments}
                  mode={attachmentsListContext.mode}
                  onDelete={handleDeleteAttachment}
                />
              )}
              {/* ChatWindow - keep mounted but hidden when attachments list is shown */}
              {showChatWindow && activeChatId && (
                <div
                  className={
                    showAttachmentsList
                      ? 'hidden'
                      : 'flex flex-col flex-1 overflow-hidden'
                  }
                >
                  <ChatWindow
                    chatId={activeChatId}
                    chatType={activeChatType}
                    cards={contextCards}
                    messages={displayMessages}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    onAddLocalMessage={handleAddLocalMessage}
                    inputDisabled={
                      activeChatType === 'pipeline' && isPipelineExecuting
                    }
                    isExternalLoading={isResuming}
                    pipelineProgress={pipelineProgressContent}
                    hidePipelinePlans={isPipelineExecuting}
                    isInputAttachmentsListOpen={
                      showAttachmentsList &&
                      attachmentsListContext?.mode === 'input'
                    }
                  />
                </div>
              )}
              {/* ChatSidebar - only shown when no chat is active */}
              {showSidebar && !showChatWindow && (
                <ChatSidebar
                  activeChatId={activeChatId}
                  onChatSelect={handleChatSelect}
                  onDeleteChat={handleDeleteChat}
                />
              )}
            </div>
          </>
        )}
      </m.div>
    </m.div>
  );
};

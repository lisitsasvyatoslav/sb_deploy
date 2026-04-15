import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolProgressEvent } from '@/services/api/chat';
import type {
  AttachmentListItemData,
  AttachmentListMode,
  AttachmentType,
} from '@/features/chat/components/Attachments';
import type { ChatType } from '@/types/chat';

export type ChatTradesLabelType = 'positions' | 'tickers' | 'trades';

export interface PendingChatFile {
  fileId: string;
  filename: string;
  mimeType?: string;
}

interface ChatTradesContext {
  chatId: number;
  tradeIds: number[];
  tickerSecurityIds: Record<string, number | null>; // Ticker -> security_id mapping (null if no icon in DB)
  labelType: ChatTradesLabelType;
  selectedCount?: number; // Actual count of selected items (may differ from tickerSecurityIds size when multiple accounts share same symbol)
}

export interface LlmMessageActions {
  onThumbsUp: ((messageId: number) => void) | null;
  onThumbsDown: ((messageId: number) => void) | null;
  onCopy: ((messageId: number, content: string) => void) | null;
  onRefresh: ((messageId: number) => void) | null;
  onAddToBoard:
    | ((messageId: number, prompt: string | null, response: string) => void)
    | null;
  showActions: boolean;
  showEditToggle: boolean;
}

interface ChatState {
  isChatSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isChatExpanded: boolean;
  activeChatId: number | null;
  activeChatType: ChatType;
  chatWidth: number;
  /**
   * Persisted flag — true once we've either auto-selected the first chat
   * for a fresh user OR the user has explicitly closed the chat. Prevents
   * the auto-init effect from re-opening a chat the user closed.
   */
  chatAutoInitDone: boolean;
  chatTradesContext: ChatTradesContext | null;
  chatContextCards: Record<number, number[]>; // chatId -> cardIds[]
  /** Temporary queue of files to attach to the next chat (picked up by ChatWindow) */
  pendingChatFiles: PendingChatFile[];
  onClearTradesSelection?: () => void;
  /** Tool execution progress (transient, not persisted) */
  toolProgress: Record<string, ToolProgressEvent>;
  /** Callback to stop current generation (transient, not persisted) */
  stopGeneration: (() => void) | null;
  toggleSidebar: () => void;
  setChatExpanded: (expanded: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setChatAutoInitDone: (done: boolean) => void;
  setActiveChatId: (id: number | null, type?: ChatType) => void;
  setChatWidth: (width: number) => void;
  setChatTradesContext: (context: ChatTradesContext | null) => void;
  setChatContextCards: (chatId: number, cardIds: number[]) => void;
  addCardsToChatContext: (chatId: number, cardIds: number[]) => number; // Returns count of newly added cards
  removeChatContextCards: (chatId: number) => void;
  setPendingChatFiles: (files: PendingChatFile[]) => void;
  clearPendingChatFiles: () => void;
  setOnClearTradesSelection: (callback: (() => void) | undefined) => void;
  updateToolProgress: (type: string, event: ToolProgressEvent) => void;
  clearToolProgress: () => void;
  setStopGeneration: (fn: (() => void) | null) => void;
  /** Callback to send a message in the active chat (transient, set by ChatManager) */
  sendMessage:
    | ((
        message: string,
        contextCards: number[],
        fileIds?: string[],
        model?: string,
        settings?: { maxTokens?: number | null; temperature?: number | null },
        tradeIds?: number[],
        linkUrls?: string[]
      ) => Promise<void>)
    | null;
  setSendMessage: (fn: ChatState['sendMessage']) => void;
  /** Callback to remove a card from chat context (transient, set by ChatManager) */
  removeCard: ((cardId: number) => void) | null;
  setRemoveCard: (fn: ((cardId: number) => void) | null) => void;
  /** Callback to save LLM response as a board card (transient, set by ChatManager) */
  saveResponseAsCard:
    | ((
        messageId: number,
        promptTitle: string,
        response: string,
        contextCardIds: number[]
      ) => Promise<void>)
    | null;
  setSaveResponseAsCard: (
    fn:
      | ((
          messageId: number,
          promptTitle: string,
          response: string,
          contextCardIds: number[]
        ) => Promise<void>)
      | null
  ) => void;
  /** Callback to refresh messages after survey/welcome ack (transient, set by ChatManager) */
  onMessagesUpdated: (() => void) | null;
  setOnMessagesUpdated: (fn: (() => void) | null) => void;
  /** Remove all attached trades and clear selection */
  removeAllTrades: () => void;
  /** Callback to trigger file attachment dialog (transient, set by ChatWindow) */
  attachFileTrigger: (() => void) | null;
  setAttachFileTrigger: (fn: (() => void) | null) => void;
  /** Whether a board card is being dragged over the chat panel (transient) */
  isDragOverChat: boolean;
  setIsDragOverChat: (value: boolean) => void;
  /** Callback to open attachments list panel (transient, set by ChatManager) */
  openAttachmentsList:
    | ((
        attachments: AttachmentListItemData[],
        mode: AttachmentListMode,
        onDelete?: (id: string | number, type: AttachmentType) => void,
        messageId?: number
      ) => void)
    | null;
  setOpenAttachmentsList: (fn: ChatState['openAttachmentsList']) => void;
  /** LLM response action callbacks (transient, registered by ChatWindow) */
  llmActions: LlmMessageActions;
  setLlmActions: (actions: LlmMessageActions) => void;
  closeAll: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      isChatSidebarOpen: false,
      isSidebarCollapsed: false,
      isChatExpanded: false,
      activeChatId: null,
      activeChatType: 'chat',
      chatWidth: 480,
      chatAutoInitDone: false,
      chatTradesContext: null,
      chatContextCards: {},
      pendingChatFiles: [],
      onClearTradesSelection: undefined,
      toolProgress: {},
      stopGeneration: null,
      setChatExpanded: (expanded) => set({ isChatExpanded: expanded }),
      toggleSidebar: () =>
        set((state) => ({ isChatSidebarOpen: !state.isChatSidebarOpen })),
      openSidebar: () => set({ isChatSidebarOpen: true }),
      closeSidebar: () => set({ isChatSidebarOpen: false }),
      setChatAutoInitDone: (done) => set({ chatAutoInitDone: done }),
      toggleSidebarCollapse: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setActiveChatId: (id, type) =>
        set({ activeChatId: id, activeChatType: type ?? 'chat' }),
      setChatWidth: (width) => set({ chatWidth: width }),
      setChatTradesContext: (context) => set({ chatTradesContext: context }),
      setChatContextCards: (chatId, cardIds) =>
        set((state) => ({
          chatContextCards: {
            ...state.chatContextCards,
            [chatId]: cardIds,
          },
        })),
      addCardsToChatContext: (chatId, cardIds) => {
        const state = get();
        const existingCards = state.chatContextCards[chatId] || [];
        const newlyAddedCards = cardIds.filter(
          (id) => !existingCards.includes(id)
        );
        const uniqueCards = [...new Set([...existingCards, ...cardIds])];

        set((state) => ({
          chatContextCards: {
            ...state.chatContextCards,
            [chatId]: uniqueCards,
          },
        }));

        return newlyAddedCards.length;
      },
      removeChatContextCards: (chatId) =>
        set((state) => {
          const next = { ...state.chatContextCards };
          delete next[chatId];
          return { chatContextCards: next };
        }),
      setPendingChatFiles: (files) => set({ pendingChatFiles: files }),
      clearPendingChatFiles: () => set({ pendingChatFiles: [] }),
      setOnClearTradesSelection: (callback) =>
        set({ onClearTradesSelection: callback }),
      updateToolProgress: (type, event) =>
        set((state) => ({
          toolProgress: { ...state.toolProgress, [type]: event },
        })),
      clearToolProgress: () => set({ toolProgress: {} }),
      setStopGeneration: (fn) => set({ stopGeneration: fn }),
      sendMessage: null,
      setSendMessage: (fn) => set({ sendMessage: fn }),
      removeCard: null,
      setRemoveCard: (fn) => set({ removeCard: fn }),
      saveResponseAsCard: null,
      setSaveResponseAsCard: (fn) => set({ saveResponseAsCard: fn }),
      onMessagesUpdated: null,
      setOnMessagesUpdated: (fn) => set({ onMessagesUpdated: fn }),
      removeAllTrades: () => {
        const { onClearTradesSelection } = get();
        set({ chatTradesContext: null });
        onClearTradesSelection?.();
      },
      isDragOverChat: false,
      setIsDragOverChat: (value) => set({ isDragOverChat: value }),
      attachFileTrigger: null,
      setAttachFileTrigger: (fn) => set({ attachFileTrigger: fn }),
      openAttachmentsList: null,
      setOpenAttachmentsList: (fn) => set({ openAttachmentsList: fn }),
      llmActions: {
        onThumbsUp: null,
        onThumbsDown: null,
        onCopy: null,
        onRefresh: null,
        onAddToBoard: null,
        showActions: true,
        showEditToggle: true,
      },
      setLlmActions: (actions) => set({ llmActions: actions }),
      closeAll: () =>
        set({
          isChatSidebarOpen: false,
          activeChatId: null,
          activeChatType: 'chat',
          chatTradesContext: null,
          // Mark auto-init as done so the user's explicit close survives
          // a page refresh — otherwise the auto-init effect would re-pick
          // the most recent chat and re-open the panel.
          chatAutoInitDone: true,
        }),
    }),
    {
      name: 'chat-sidebar-state', // localStorage key
      partialize: (state) => ({
        isChatSidebarOpen: state.isChatSidebarOpen,
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeChatId: state.activeChatId,
        activeChatType: state.activeChatType,
        chatWidth: state.chatWidth,
        chatAutoInitDone: state.chatAutoInitDone,
        // chatContextCards and chatTradesContext are not persisted to localStorage
        // activeChatType is persisted and validated against server on initialization
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // chatContextCards is transient — discard any stale data loaded from localStorage
        state.chatContextCards = {};

        // Clean up legacy chat_*_context_cards keys (one-time, no-op once removed)
        queueMicrotask(() => {
          const oldKeys = Array.from({ length: localStorage.length }, (_, i) =>
            localStorage.key(i)
          ).filter(
            (key): key is string =>
              key !== null &&
              key.startsWith('chat_') &&
              key.endsWith('_context_cards')
          );
          oldKeys.forEach((key) => localStorage.removeItem(key));
        });
      },
    }
  )
);

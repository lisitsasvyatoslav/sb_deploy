/**
 * useBoard.ts - Main board orchestration hook
 *
 * Delegates to:
 * - useBoardDialogs                    Dialog state (file preview, edit, create)
 * - useSelectionToolbar                Toolbar actions for selected cards
 * - useBoardGlobalEvents               Global window event listeners + root context menu
 * - useBoardHandlers                   ReactFlow event handlers
 * - useBoardActions                    CRUD operations
 * - useBoardSelection                  Selection & highlighting
 */

import {
  convertEdgeFromAPI,
  deduplicateEdges,
  APIEdgeResponse,
} from '@/features/board/utils/edgeHelpers';
import { createConnectionValidator } from '@/features/board/ports';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { useBoardDialogs } from '@/features/board/hooks/useBoardDialogs';
import { useBoardGlobalEvents } from '@/features/board/hooks/useBoardGlobalEvents';
import { useBoardHandlers } from '@/features/board/hooks/useBoardHandlers';
import { useBoardSelection } from '@/features/board/hooks/useBoardSelection';
import { useSelectionToolbar } from '@/features/board/hooks/useSelectionToolbar';
import { useCenterOnCard } from '@/features/board/hooks/useCenterOnCard';
import { usePasteToBoard } from '@/features/board/hooks/usePasteToBoard';
import { useBoardFullQuery, useEdgesQuery } from '@/features/board/queries';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useContextMenuState } from '@/shared/hooks/useContextMenuState';
import { useBoardStore } from '@/stores/boardStore';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useNewsPreviewStore } from '@/stores/newsPreviewStore';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useChatStore } from '@/stores/chatStore';
import { logger } from '@/shared/utils/logger';
import { ymBoardTypeFromTemplate } from '@/features/board/utils/ymBoardType';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

interface UseBoardConfig {
  boardId: number;
  highlightCardId?: number;
}

/**
 * Main orchestration hook for Board component
 * Handles: data fetching, initialization, viewport management, and hook composition
 */
export const useBoard = ({ boardId, highlightCardId }: UseBoardConfig) => {
  const lastDataHash = useRef<string>('');
  const focusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reactFlowInstance = useReactFlow();

  const isValidConnection = useMemo(
    () => createConnectionValidator(() => useBoardStore.getState().nodes),
    []
  );

  // Utility: clear ReactFlow focus
  const clearReactFlowFocus = useCallback(() => {
    clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      const focusedElement = document.activeElement as HTMLElement;
      if (
        focusedElement &&
        focusedElement.classList.contains('react-flow__node')
      ) {
        focusedElement.blur();
      }
    }, 100);
  }, []);

  // Cleanup focus timer on unmount
  useEffect(() => {
    return () => clearTimeout(focusTimerRef.current);
  }, []);

  // Data fetching
  const {
    data: boardData,
    isLoading,
    isSuccess,
    error,
  } = useBoardFullQuery(boardId);
  const { data: allEdgesFromAPI } = useEdgesQuery();

  const ymBoardType = useMemo(
    () => ymBoardTypeFromTemplate(boardData?.board?.template),
    [boardData?.board?.template]
  );

  // Store
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isDragOver,
    setNodes,
    initializeBoardData,
  } = useBoardStore();

  // Load viewport immediately (before first render) using boardId directly
  const initialViewport = useState(() => {
    try {
      const key = `board-${boardId}-viewport`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      logger.error('useBoard', 'Failed to load initial viewport', error);
    }
    return null;
  })[0];

  // Actions (CRUD operations)
  const actions = useBoardActions({ boardId });

  // News preview modal (using global store)
  const { openWithCard: openNewsPreview } = useNewsPreviewStore();

  // Dialog state (file preview, edit, create)
  const {
    openFilePreview,
    openEditDialog,
    openCreateDialog,
    createDialogProps,
    createDialogPosition,
    filePreviewProps: _filePreviewProps,
  } = useBoardDialogs({ reactFlowInstance, clearReactFlowFocus });

  // Paste handling
  const pasteHandlers = usePasteToBoard({
    reactFlowInstance,
    boardId,
    createCard: actions.createCard,
    deleteCard: actions.deleteCard,
    uploadFile: actions.uploadFile,
  });

  // Context menu state
  const contextMenuState = useContextMenuState();

  // Selection & UI (over cardSelectionStore + ReactFlow)
  const {
    selectionRef,
    nodeClickRef,
    highlightNodes,
    getCardsInSelection,
    recalcSelectionUI,
    selectCardFromNode,
  } = useBoardSelection({ nodes, setNodes });

  // Card selection from Zustand store
  const selectedCards = useCardSelectionStore((s) => s.selectedCards);
  const clearCardSelection = useCardSelectionStore((s) => s.clearSelection);

  // Board UI state from Zustand store
  const selectionBox = useBoardUIStore((s) => s.selectionBox);
  const toolbarState = useBoardUIStore((s) => s.toolbarState);
  const setToolbarState = useBoardUIStore((s) => s.setToolbarState);
  const groupOutline = useBoardUIStore((s) => s.groupOutline);
  const setGroupOutline = useBoardUIStore((s) => s.setGroupOutline);

  const clearSelectionUI = useCallback(() => {
    clearCardSelection();
    highlightNodes([]);
    setToolbarState((prev) => ({ ...prev, visible: false }));
    setGroupOutline((prev) => ({ ...prev, visible: false }));
  }, [clearCardSelection, highlightNodes, setToolbarState, setGroupOutline]);

  const { openModal: openTickerModal } = useTickerModalStore();

  // Chat integration for drag-to-chat
  const {
    createChatWithCards,
    addCardsToActiveChat,
    activeChatId: chatActiveChatId,
  } = useChatManager();
  const { openSidebar: openChatSidebar } = useChatStore();

  const handleDropCardsToChat = useCallback(
    async (cardIds: number[]) => {
      if (cardIds.length === 0) return;
      if (chatActiveChatId) {
        addCardsToActiveChat(cardIds, boardId);
      } else {
        await createChatWithCards(cardIds, undefined, undefined, boardId);
        openChatSidebar();
      }
    },
    [
      chatActiveChatId,
      addCardsToActiveChat,
      createChatWithCards,
      boardId,
      openChatSidebar,
    ]
  );

  // Toolbar actions for selected cards
  const { handleToolbarDelete, toolbarHandlers, deleteConfirmDialogProps } =
    useSelectionToolbar({
      boardId,
      boardData,
      actions,
      clearSelectionUI,
    });

  // Handlers (ReactFlow events, delegates to actions)
  const handlers = useBoardHandlers({
    boardId,
    nodes,
    actions,
    contextMenuState,
    selection: {
      nodeClickRef,
      selectionRef,
      highlightNodes,
      getCardsInSelection,
      recalcSelectionUI,
      selectCardFromNode,
    },
    callbacks: {
      onOpenNewsPreview: openNewsPreview,
      onOpenFilePreview: openFilePreview,
      onOpenEditDialog: openEditDialog,
      onSelectionUiUpdate: recalcSelectionUI,
      handleToolbarDelete,
      onDropCardsToChat: handleDropCardsToChat,
    },
  });

  // Global window event listeners + root context menu handler
  const { handleRootContextMenu } = useBoardGlobalEvents({
    boardId,
    ymBoardType,
    actions,
    reactFlowInstance,
    openCreateDialog,
    openContextMenu: contextMenuState.openContextMenu,
    contextMenuOpen: contextMenuState.contextMenuOpen,
    highlightNodes,
    clearCardSelection,
  });

  // Initialize board data
  useEffect(() => {
    if (!boardData || !allEdgesFromAPI) return;

    const cardsCount = boardData?.cards?.length || 0;
    const edgesCount = allEdgesFromAPI?.edges?.length || 0;

    const cardsHash =
      boardData?.cards
        ?.map(
          (card) =>
            `${card.id}-${card.title || ''}-${card.content || ''}-${card.color || ''}-${JSON.stringify(card.meta)}-${card.updatedAt || ''}-${card.signalsCount || 0}-${card.signals?.[0]?.createdAt || ''}`
        )
        .join('|') || '';

    const currentHash = `${boardId}-${cardsCount}-${edgesCount}-${cardsHash}`;

    if (lastDataHash.current !== currentHash) {
      lastDataHash.current = currentHash;

      const converted = (
        allEdgesFromAPI.edges as unknown as APIEdgeResponse[]
      ).map(convertEdgeFromAPI);
      const reactFlowEdges = deduplicateEdges(converted);

      initializeBoardData(boardData, reactFlowEdges);
    }
  }, [boardData, allEdgesFromAPI, boardId, initializeBoardData]);

  // Fit view only if no saved viewport
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0 && !initialViewport) {
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, nodes.length, initialViewport]);

  // Center on highlighted card if cardId is provided in URL
  useCenterOnCard({
    cardId: highlightCardId,
    reactFlowInstance,
    nodes,
    isLoading,
    isLoaded: isSuccess,
  });

  return {
    isLoading,
    error,

    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isDragOver,
    initialViewport,

    handlers,
    isValidConnection,
    onRootContextMenu: handleRootContextMenu,

    pasteHandlers,

    createDialogProps: {
      ...createDialogProps,
      initialPosition:
        contextMenuState.contextMenuFlowPosition ?? createDialogPosition,
    },
    selectedCards,

    contextMenuProps: {
      open: contextMenuState.contextMenuOpen,
      position: contextMenuState.contextMenuPosition,
      onClose: () => {
        contextMenuState.closeContextMenu();
        clearSelectionUI();
      },
      onCreateNote: () => {
        contextMenuState.closeContextMenu();
        openCreateDialog({ createType: 'card', cardType: 'note' });
      },
      onSearchTicker: () => {
        openTickerModal();
      },
    },

    clearReactFlowFocus,
    selectionBox,
    toolbarState: {
      ...toolbarState,
      visible: toolbarState.visible,
    },
    groupOutline,
    toolbarHandlers,
    deleteConfirmDialogProps,
  };
};

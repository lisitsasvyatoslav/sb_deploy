/**
 * useBoardHandlers.ts - ReactFlow event handlers for board interactions
 *
 * Thin composition root that delegates to focused sub-hooks in ./boardHandlers/.
 * Each sub-hook owns a specific concern (drag, selection, drop, edges, viewport).
 *
 * Functions:
 * - useBoardHandlers({ boardId, nodes, actions, contextMenuState, selection, callbacks })  Main hook
 * - saveNodePositions(updatedNodes)                        Saves changed node positions to API
 * - onNodeDragStart(event, node)                           Initiates node drag, adds visual feedback
 * - onNodeDragStop(event, draggedNode)                     Ends drag, triggers position save
 * - onNodeDoubleClick(event, node)                         Opens modal/preview based on card type
 * - onConnect(params)                                      Handles edge connection between nodes
 * - onDragOver(event)                                      Handles drag over board (files/news)
 * - onDragLeave(event)                                     Handles drag leave from board
 * - onDrop(event)                                          Handles drop of files/news onto board
 * - onMove(event, viewport)                                Saves viewport position with debounce
 */

// TODO: Replace `as unknown as Card` double assertions with proper Node<Card>
// generics or a runtime type guard. The cast bypasses type checking — if node
// data shape diverges from Card, errors surface at runtime, not compile time.
// Affects all `node.data as unknown as Card` usages in this file.
// TODO: refactor this file

import {
  type UseBoardHandlersConfig,
  useBoardNodeDrag,
  useBoardPaneSelection,
  useBoardNodeInteraction,
  useBoardDropZone,
  useBoardEdgeConnect,
  useBoardViewport,
} from './boardHandlers';
import { useEffect, useRef } from 'react';

export type {
  SelectionAPI,
  BoardCallbacks,
  UseBoardHandlersConfig,
} from './boardHandlers';

export const useBoardHandlers = ({
  boardId,
  nodes,
  actions,
  contextMenuState,
  selection,
  callbacks,
}: UseBoardHandlersConfig) => {
  // Shared refs — created here and passed to sub-hooks that need them
  const isDragging = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const selectionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionUpdateCancelledRef = useRef(false);
  const chatDropZoneRef = useRef<HTMLElement | null>(null);
  const lastViewportZoom = useRef<number | null>(null);
  const lastViewportPosition = useRef<{ x: number; y: number } | null>(null);
  const viewportUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Sub-hooks ---

  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useBoardNodeDrag({
    boardId,
    selection: {
      nodeClickRef: selection.nodeClickRef,
      selectCardFromNode: selection.selectCardFromNode,
    },
    callbacks: {
      onSelectionUiUpdate: callbacks.onSelectionUiUpdate,
      onDropCardsToChat: callbacks.onDropCardsToChat,
    },
    refs: {
      isDragging,
      lastSavedPositions,
      selectionUpdateTimeoutRef,
      selectionUpdateCancelledRef,
      chatDropZoneRef,
    },
  });

  const {
    handlePaneMouseDown,
    handlePaneMouseMove,
    handlePaneMouseUp,
    handlePaneClick,
    handlePaneContextMenu,
  } = useBoardPaneSelection({
    contextMenuState,
    selection: {
      nodeClickRef: selection.nodeClickRef,
      selectionRef: selection.selectionRef,
      highlightNodes: selection.highlightNodes,
      getCardsInSelection: selection.getCardsInSelection,
      recalcSelectionUI: selection.recalcSelectionUI,
    },
    refs: {
      selectionUpdateTimeoutRef,
      selectionUpdateCancelledRef,
      viewportUpdateTimeoutRef,
      saveTimeoutRef,
    },
  });

  const { handleNodeClick, handleNodeContextMenu, onNodeDoubleClick } =
    useBoardNodeInteraction({
      boardId,
      selection: {
        nodeClickRef: selection.nodeClickRef,
        selectCardFromNode: selection.selectCardFromNode,
      },
      callbacks: {
        handleToolbarDelete: callbacks.handleToolbarDelete,
      },
    });

  const { onDragOver, onDragLeave, onDrop } = useBoardDropZone({
    boardId,
    actions,
  });

  const { onConnect } = useBoardEdgeConnect({ nodes });

  const { onMove } = useBoardViewport({
    callbacks: {
      onSelectionUiUpdate: callbacks.onSelectionUiUpdate,
    },
    refs: {
      saveTimeoutRef,
      selectionUpdateCancelledRef,
      viewportUpdateTimeoutRef,
      lastViewportZoom,
      lastViewportPosition,
    },
  });

  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      if (selectionUpdateTimeoutRef.current) {
        clearTimeout(selectionUpdateTimeoutRef.current);
      }
      if (viewportUpdateTimeoutRef.current) {
        clearTimeout(viewportUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    onMove,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodeDoubleClick,
    onConnect,
    onDragOver,
    onDragLeave,
    onDrop,
    // Selection handlers
    onNodeClick: handleNodeClick,
    onPaneClick: handlePaneClick,
    onPaneMouseDown: handlePaneMouseDown,
    onPaneMouseMove: handlePaneMouseMove,
    onPaneMouseUp: handlePaneMouseUp,
    onPaneContextMenu: handlePaneContextMenu,
    onNodeContextMenu: handleNodeContextMenu,
  };
};

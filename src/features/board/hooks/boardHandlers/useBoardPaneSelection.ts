import { EMPTY_CLICK_INFO, SelectionAPI } from './types';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useContextMenuState } from '@/shared/hooks/useContextMenuState';
import { useCardModalStore } from '@/stores/cardModalStore';
import { RefObject, useCallback, useEffect } from 'react';
import React from 'react';

interface UseBoardPaneSelectionConfig {
  contextMenuState: ReturnType<typeof useContextMenuState>;
  selection: Pick<
    SelectionAPI,
    | 'nodeClickRef'
    | 'selectionRef'
    | 'highlightNodes'
    | 'getCardsInSelection'
    | 'recalcSelectionUI'
  >;
  refs: {
    selectionUpdateTimeoutRef: RefObject<NodeJS.Timeout | null>;
    selectionUpdateCancelledRef: RefObject<boolean>;
    viewportUpdateTimeoutRef: RefObject<NodeJS.Timeout | null>;
    saveTimeoutRef: RefObject<NodeJS.Timeout | null>;
  };
}

export const useBoardPaneSelection = ({
  contextMenuState,
  selection,
  refs,
}: UseBoardPaneSelectionConfig) => {
  const {
    nodeClickRef,
    selectionRef,
    highlightNodes,
    getCardsInSelection,
    recalcSelectionUI,
  } = selection;
  const {
    selectionUpdateTimeoutRef,
    selectionUpdateCancelledRef,
    viewportUpdateTimeoutRef,
    saveTimeoutRef,
  } = refs;

  const clearCardSelection = useCardSelectionStore((s) => s.clearSelection);
  const setSelectedCards = useCardSelectionStore((s) => s.setSelectedCards);
  const setSelectionBox = useBoardUIStore((s) => s.setSelectionBox);
  const setToolbarState = useBoardUIStore((s) => s.setToolbarState);
  const setGroupOutline = useBoardUIStore((s) => s.setGroupOutline);

  const handlePaneMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (useCardModalStore.getState().isOpen) return;

      if (event.button !== 2) return;
      event.preventDefault();
      contextMenuState.closeContextMenu();

      highlightNodes([]);
      clearCardSelection();
      nodeClickRef.current = { ...EMPTY_CLICK_INFO };

      const startPoint = { x: event.clientX, y: event.clientY };
      selectionRef.current = {
        isSelecting: false,
        start: startPoint,
      };
      setSelectionBox({
        isSelecting: false,
        start: startPoint,
        current: startPoint,
      });
    },
    [
      contextMenuState,
      highlightNodes,
      clearCardSelection,
      nodeClickRef,
      selectionRef,
      setSelectionBox,
    ]
  );

  const handlePaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const start = selectionRef.current.start;
      if (!start) return;

      if (!(event.buttons & 2)) {
        selectionRef.current = { isSelecting: false, start: null };
        setSelectionBox({ isSelecting: false, start: null, current: null });
        return;
      }

      const deltaX = Math.abs(event.clientX - start.x);
      const deltaY = Math.abs(event.clientY - start.y);
      const hasPassedThreshold = deltaX > 4 || deltaY > 4;

      if (!selectionRef.current.isSelecting) {
        if (!hasPassedThreshold) {
          setSelectionBox((prev) => ({
            ...prev,
            current: { x: event.clientX, y: event.clientY },
          }));
          return;
        }
        selectionRef.current.isSelecting = true;
      }

      event.preventDefault();
      setSelectionBox({
        isSelecting: true,
        start,
        current: { x: event.clientX, y: event.clientY },
      });

      const rect = {
        left: Math.min(start.x, event.clientX),
        top: Math.min(start.y, event.clientY),
        right: Math.max(start.x, event.clientX),
        bottom: Math.max(start.y, event.clientY),
      };
      const selectedNodeIds = getCardsInSelection(rect);
      highlightNodes(selectedNodeIds);
    },
    [getCardsInSelection, highlightNodes, selectionRef, setSelectionBox]
  );

  const handlePaneMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 2) {
        return;
      }

      if (useCardModalStore.getState().isOpen) return;

      const start = selectionRef.current.start;
      const wasSelecting = selectionRef.current.isSelecting;

      const target = event.target as HTMLElement | null;
      if (!wasSelecting && target?.closest('.react-flow__node')) {
        return;
      }

      selectionRef.current = { isSelecting: false, start: null };
      setSelectionBox({ isSelecting: false, start: null, current: null });

      if (wasSelecting && start) {
        event.preventDefault();
        const rect = {
          left: Math.min(start.x, event.clientX),
          top: Math.min(start.y, event.clientY),
          right: Math.max(start.x, event.clientX),
          bottom: Math.max(start.y, event.clientY),
        };

        const selectedNodeIds = getCardsInSelection(rect);
        highlightNodes(selectedNodeIds);

        const selectedCardIds = selectedNodeIds.map((id) =>
          parseInt(id.replace('card-', ''), 10)
        );
        setSelectedCards(selectedCardIds);

        recalcSelectionUI({
          nodeIds: selectedNodeIds,
          cardIds: selectedCardIds,
        });
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      highlightNodes([]);
      clearCardSelection();
      setToolbarState((prev) => ({ ...prev, visible: false }));
      setGroupOutline((prev) => ({ ...prev, visible: false }));
      contextMenuState.openContextMenu(event.clientX, event.clientY);
    },
    [
      setSelectedCards,
      clearCardSelection,
      contextMenuState,
      getCardsInSelection,
      highlightNodes,
      recalcSelectionUI,
      selectionRef,
      setGroupOutline,
      setSelectionBox,
      setToolbarState,
    ]
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (useCardModalStore.getState().isOpen) return;

      if (event.button !== 0) {
        return;
      }

      // Guard: if click originated inside a card node (e.g. interactive content
      // stopped pointerDown propagation so React Flow routed the click to pane
      // instead of node), do NOT clear the selection — the global mouseup
      // listener already handled card selection.
      const target = event.target as HTMLElement | null;
      if (target?.closest('.react-flow__node')) {
        return;
      }

      // IMPORTANT: cancel ALL timeouts and pending RAFs that could restore toolbar/groupOutline
      selectionUpdateCancelledRef.current = true;
      if (selectionUpdateTimeoutRef.current) {
        clearTimeout(selectionUpdateTimeoutRef.current);
        selectionUpdateTimeoutRef.current = null;
      }
      if (viewportUpdateTimeoutRef.current) {
        clearTimeout(viewportUpdateTimeoutRef.current);
        viewportUpdateTimeoutRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Left click on pane: clear selection and hide menu/toolbar/outline
      contextMenuState.closeContextMenu();
      highlightNodes([]);
      clearCardSelection();
      setToolbarState((prev) => ({ ...prev, visible: false }));
      setGroupOutline((prev) => ({ ...prev, visible: false }));
      // Reset card click state
      nodeClickRef.current = { ...EMPTY_CLICK_INFO };
    },
    [
      clearCardSelection,
      contextMenuState,
      highlightNodes,
      nodeClickRef,
      setGroupOutline,
      setToolbarState,
      selectionUpdateCancelledRef,
      selectionUpdateTimeoutRef,
      viewportUpdateTimeoutRef,
      saveTimeoutRef,
    ]
  );

  // Union type: @xyflow/react fires native MouseEvent, React handlers fire React.MouseEvent
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (useCardModalStore.getState().isOpen) return;

      event.preventDefault();
      event.stopPropagation();

      // First right click on empty field is handled through onPaneMouseDown/Up.
      // Here we only suppress the browser menu to avoid duplicate logic.
    },
    []
  );

  // Global mouseup for right click: reset selection if button released outside of board
  useEffect(() => {
    const handleGlobalRmbUp = (event: MouseEvent) => {
      if (event.button !== 2) return;
      if (!selectionRef.current.start) return;

      // If mouseup occurred inside the board, handlePaneMouseUp will handle it itself
      const target = event.target as HTMLElement | null;
      if (target?.closest('.lmx__home__main-container')) return;

      selectionRef.current = { isSelecting: false, start: null };
      setSelectionBox({ isSelecting: false, start: null, current: null });
    };

    document.addEventListener('mouseup', handleGlobalRmbUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalRmbUp);
    };
  }, [selectionRef, setSelectionBox]);

  return {
    handlePaneMouseDown,
    handlePaneMouseMove,
    handlePaneMouseUp,
    handlePaneClick,
    handlePaneContextMenu,
  };
};

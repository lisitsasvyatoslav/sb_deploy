import { EMPTY_CLICK_INFO, SelectionAPI } from './types';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { isEditableElement } from '@/shared/utils/dom';
import { useCardModalStore } from '@/stores/cardModalStore';
import { Card } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import React from 'react';
import { Node } from '@xyflow/react';

interface UseBoardNodeInteractionConfig {
  boardId: number;
  selection: Pick<SelectionAPI, 'nodeClickRef' | 'selectCardFromNode'>;
  callbacks: {
    handleToolbarDelete: () => void;
  };
}

export const useBoardNodeInteraction = ({
  boardId,
  selection,
  callbacks,
}: UseBoardNodeInteractionConfig) => {
  const { nodeClickRef, selectCardFromNode } = selection;
  const { handleToolbarDelete } = callbacks;
  const { openForBoardTicker } = useTickerModalStore();

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (useCardModalStore.getState().isOpen) return;

      if (!node.id.startsWith('card-')) {
        return;
      }

      if (event.button === 0) {
        // Left-click selects only via header (card-select-zone)
        const clickTarget = event.target as HTMLElement;
        if (!clickTarget?.closest('.card-select-zone')) {
          return;
        }

        // Detect click on ticker_adder widget to open ticker picker modal
        const nodeData = node.data as unknown as Card;
        if (
          nodeData?.type === 'widget' &&
          nodeData?.meta?.widgetType === 'ticker_adder'
        ) {
          openForBoardTicker(nodeData.id as number, boardId);
          nodeClickRef.current = { ...EMPTY_CLICK_INFO };
          return;
        }

        // Backup selection: if global mouseup didn't select (e.g. micro-drag jitter),
        // ensure card gets selected here as a fallback.
        const cardId = parseInt(node.id.replace('card-', ''), 10);
        const currentSelected = useCardSelectionStore.getState().selectedCards;
        if (event.shiftKey || !currentSelected.includes(cardId)) {
          selectCardFromNode(event, node);
        }

        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const clickInfo = nodeClickRef.current;

      if (clickInfo.node?.id === node.id && clickInfo.button === event.button) {
        // Global mouseup hasn't processed this yet — handle here
        const deltaX = Math.abs(event.clientX - clickInfo.startX);
        const deltaY = Math.abs(event.clientY - clickInfo.startY);
        const hasMoved = deltaX > 4 || deltaY > 4;

        if (!hasMoved && !clickInfo.wasDragged) {
          selectCardFromNode(event, node);
        }

        nodeClickRef.current = { ...EMPTY_CLICK_INFO };
      } else if (!clickInfo.node) {
        // Global mouseup already reset clickRef. Verify card is selected —
        // it may not be if the mouseup target didn't match (e.g. interactive
        // content stopped propagation or DOM changed between mousedown/mouseup).
        const cardId = parseInt(node.id.replace('card-', ''), 10);
        const currentSelected = useCardSelectionStore.getState().selectedCards;
        if (!event.shiftKey && !currentSelected.includes(cardId)) {
          selectCardFromNode(event, node);
        }
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [nodeClickRef, selectCardFromNode, openForBoardTicker, boardId]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (useCardModalStore.getState().isOpen) return;

      if (!node.id.startsWith('card-')) {
        return;
      }

      // Information about the click should already be saved in the global mousedown
      // Here we only suppress the browser menu
      // Selection will occur in mouseup
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as unknown as Card;
      if (!nodeData?.id || !boardId) return;

      // Types that don't open a modal
      if (
        nodeData.type === 'widget' ||
        nodeData.type === 'strategy' ||
        nodeData.type === 'trading_idea'
      ) {
        return;
      }

      useCardModalStore.getState().open(nodeData.id, boardId);
    },
    [boardId]
  );

  // Global keyboard handler for Delete key (TD-579)
  const deleteHandlerRef = useRef(handleToolbarDelete);
  deleteHandlerRef.current = handleToolbarDelete;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (useCardModalStore.getState().isOpen) return;

      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      // Don't trigger deletion if user is typing in input/textarea
      const target = event.target as HTMLElement | null;
      if (isEditableElement(target)) {
        return;
      }

      // Prevent default browser behavior (e.g., navigation back on Backspace key)
      event.preventDefault();

      // Trigger delete action through ref (always up to date)
      deleteHandlerRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty array - handler is placed only once!

  return {
    handleNodeClick,
    handleNodeContextMenu,
    onNodeDoubleClick,
  };
};

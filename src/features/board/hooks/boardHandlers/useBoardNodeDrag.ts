import { EMPTY_CLICK_INFO, SelectionAPI } from './types';
import { api } from '@/services/api';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useChatStore } from '@/stores/chatStore';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import {
  useBoardStore,
  setActiveDrag,
  clearActiveDrag,
  getActiveDragStartPositions,
} from '@/stores/boardStore';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { Card } from '@/types';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast } from '@/shared/utils/toast';
import { RefObject, useCallback } from 'react';
import { useCardModalStore } from '@/stores/cardModalStore';
import React from 'react';
import { Node } from '@xyflow/react';

interface UseBoardNodeDragConfig {
  boardId: number;
  selection: Pick<SelectionAPI, 'nodeClickRef' | 'selectCardFromNode'>;
  callbacks: {
    onSelectionUiUpdate?: () => void;
    onDropCardsToChat?: (cardIds: number[]) => void;
  };
  refs: {
    isDragging: RefObject<boolean>;
    lastSavedPositions: RefObject<Map<string, { x: number; y: number }>>;
    selectionUpdateTimeoutRef: RefObject<NodeJS.Timeout | null>;
    selectionUpdateCancelledRef: RefObject<boolean>;
    chatDropZoneRef: RefObject<HTMLElement | null>;
  };
}

export const useBoardNodeDrag = ({
  boardId,
  selection,
  callbacks,
  refs,
}: UseBoardNodeDragConfig) => {
  const { nodeClickRef, selectCardFromNode } = selection;
  const { onSelectionUiUpdate, onDropCardsToChat } = callbacks;
  const {
    isDragging,
    lastSavedPositions,
    selectionUpdateTimeoutRef,
    selectionUpdateCancelledRef,
    chatDropZoneRef,
  } = refs;

  const selectedCards = useCardSelectionStore((s) => s.selectedCards);
  const setToolbarState = useBoardUIStore((s) => s.setToolbarState);
  const setGroupOutline = useBoardUIStore((s) => s.setGroupOutline);
  const { trackEvent } = useYandexMetrika();
  const { t } = useTranslation('board');
  const { openForBoardTicker } = useTickerModalStore();

  const saveNodePositions = useCallback(
    async (updatedNodes: Node[]) => {
      if (!updatedNodes || updatedNodes.length === 0) {
        return;
      }

      try {
        const changedNodes = updatedNodes.filter((node) => {
          const lastPosition = lastSavedPositions.current.get(node.id);
          const currentPosition = {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          };

          if (!lastPosition) {
            return true;
          }

          const changed =
            lastPosition.x !== currentPosition.x ||
            lastPosition.y !== currentPosition.y;
          return changed;
        });

        if (changedNodes.length === 0) {
          return;
        }

        for (const node of changedNodes) {
          try {
            const cardId =
              node.type === 'cardNode'
                ? parseInt(node.id.replace('card-', ''))
                : parseInt(node.id.replace('idea-', ''));

            await api.updateCard(cardId, {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
              zIndex: 0,
            });

            lastSavedPositions.current.set(node.id, {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            });
          } catch (error) {
            logger.error('useBoardHandlers', 'Node position update error', {
              nodeId: node.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } catch (error) {
        logger.error('useBoardHandlers', 'Node positions save error', error);
        showErrorToast(t('toast.positionSaveError'));
      }
    },
    [t, lastSavedPositions]
  );

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const target = event.target as HTMLElement;
      if (target?.closest('.card-resize-handle')) {
        event.preventDefault?.();
        event.stopPropagation?.();
        return false;
      }

      isDragging.current = true;
      chatDropZoneRef.current = document.querySelector<HTMLElement>(
        '[data-chat-drop-zone]'
      );

      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      if (nodeElement) {
        nodeElement.classList.add('dragging');
      }

      const selectedNodeIds = new Set(selectedCards.map((id) => `card-${id}`));
      if (selectedNodeIds.has(node.id) && selectedNodeIds.size > 1) {
        const currentNodes = useBoardStore.getState().nodes;
        const startPositions = new Map<string, { x: number; y: number }>();
        for (const n of currentNodes) {
          if (selectedNodeIds.has(n.id)) {
            startPositions.set(n.id, { x: n.position.x, y: n.position.y });
          }
        }
        setActiveDrag(node.id, startPositions);
      }

      if (node.id.startsWith('card-')) {
        setToolbarState((prev) => ({ ...prev, visible: false }));
        setGroupOutline((prev) => ({ ...prev, visible: false }));
      }
    },
    [
      setToolbarState,
      setGroupOutline,
      selectedCards,
      isDragging,
      chatDropZoneRef,
    ]
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, draggedNode: Node) => {
      // Detect if mouse is over the chat panel drop zone (cached in onNodeDragStart)
      const chatPanel = chatDropZoneRef.current;
      let isOverChat = false;
      if (chatPanel) {
        const rect = chatPanel.getBoundingClientRect();
        isOverChat =
          rect.width > 0 &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
      } else {
        // Chat panel not mounted — check if near left edge of board to open sidebar
        const boardContainer = document.querySelector<HTMLElement>(
          '[data-board-container]'
        );
        if (boardContainer) {
          const boardRect = boardContainer.getBoundingClientRect();
          isOverChat = event.clientX < boardRect.left + 50;
        }
      }
      useChatStore.getState().setIsDragOverChat(isOverChat);

      // Apply visual fade to dragged card(s) when over chat zone
      const nodesToFade = [draggedNode.id];
      const selectedNodeIds = new Set(selectedCards.map((id) => `card-${id}`));
      if (selectedNodeIds.has(draggedNode.id) && selectedNodeIds.size > 1) {
        selectedNodeIds.forEach((id) => {
          if (id !== draggedNode.id) nodesToFade.push(id);
        });
      }
      for (const nodeId of nodesToFade) {
        const el = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${nodeId}"]`
        );
        if (el) {
          el.style.opacity = isOverChat ? '0.5' : '';
          el.style.transition = isOverChat ? 'opacity 150ms ease' : '';
        }
      }

      const startPositions = getActiveDragStartPositions();
      if (startPositions.size <= 1) return;

      const startPos = startPositions.get(draggedNode.id);
      if (!startPos) return;

      const deltaX = draggedNode.position.x - startPos.x;
      const deltaY = draggedNode.position.y - startPos.y;

      // Direct DOM update for instant visual sync (bypasses React render cycle)
      startPositions.forEach((nodeStartPos, nodeId) => {
        if (nodeId === draggedNode.id) return;
        const el = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${nodeId}"]`
        );
        if (el) {
          el.style.transform = `translate(${nodeStartPos.x + deltaX}px, ${nodeStartPos.y + deltaY}px)`;
        }
      });

      // React state update for consistency (batched, renders next frame)
      const { setNodes } = useBoardStore.getState();
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggedNode.id) return node;
          const nodeStartPos = startPositions.get(node.id);
          if (!nodeStartPos) return node;
          return {
            ...node,
            position: {
              x: nodeStartPos.x + deltaX,
              y: nodeStartPos.y + deltaY,
            },
          };
        })
      );
    },
    [selectedCards, chatDropZoneRef]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, draggedNode: Node) => {
      isDragging.current = false;
      chatDropZoneRef.current = null;
      // Capture start positions before clearing — used below for position restore on drop-to-chat
      const dragStartPositions = getActiveDragStartPositions();

      const nodeElement = document.querySelector<HTMLElement>(
        `[data-id="${draggedNode.id}"]`
      );
      if (nodeElement) {
        nodeElement.classList.remove('dragging');
      }

      // Clear drag-over-chat opacity on dragged + selected nodes
      const selectedNodeIds = new Set(selectedCards.map((id) => `card-${id}`));
      const nodesToClear =
        selectedNodeIds.has(draggedNode.id) && selectedNodeIds.size > 1
          ? selectedNodeIds
          : new Set([draggedNode.id]);
      for (const nodeId of nodesToClear) {
        const el = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${nodeId}"]`
        );
        if (el) {
          el.style.opacity = '';
          el.style.transition = '';
        }
      }

      // Clear active drag state now that we've read dragStartPositions
      clearActiveDrag();

      // Check if card was dropped over chat panel
      const { isDragOverChat, setIsDragOverChat } = useChatStore.getState();
      if (isDragOverChat && draggedNode.id.startsWith('card-')) {
        setIsDragOverChat(false);

        // Collect card IDs (dragged + selected if multi-select)
        const draggedCardId = parseInt(draggedNode.id.replace('card-', ''), 10);
        const isMultiDrag =
          selectedNodeIds.has(draggedNode.id) && selectedNodeIds.size > 1;
        const cardIds = isMultiDrag ? [...selectedCards] : [draggedCardId];

        // Reset node positions to pre-drag coordinates — setNodes is enough,
        // React Flow will apply transforms on the next render.
        const { setNodes } = useBoardStore.getState();
        setNodes((prev) =>
          prev.map((node) => {
            const startPos = dragStartPositions.get(node.id);
            if (startPos) {
              // Multi-drag: restore all selected nodes
              return { ...node, position: { x: startPos.x, y: startPos.y } };
            }
            if (node.id === draggedNode.id) {
              // Single drag: restore from lastSavedPositions
              const lastPos = lastSavedPositions.current.get(node.id);
              if (lastPos) {
                return {
                  ...node,
                  position: { x: lastPos.x, y: lastPos.y },
                };
              }
            }
            return node;
          })
        );

        // Add cards to chat via callback
        onDropCardsToChat?.(cardIds);

        // Restore selection UI after position reset
        if (isMultiDrag) {
          setTimeout(() => {
            requestAnimationFrame(() => {
              onSelectionUiUpdate?.();
            });
          }, 100);
        }

        nodeClickRef.current = { ...EMPTY_CLICK_INFO };
        return;
      }
      setIsDragOverChat(false);

      const lastPosition = lastSavedPositions.current.get(draggedNode.id);
      const currentPosition = {
        x: Math.round(draggedNode.position.x),
        y: Math.round(draggedNode.position.y),
      };

      const wasSelected =
        draggedNode.id.startsWith('card-') &&
        selectedCards.includes(
          parseInt(draggedNode.id.replace('card-', ''), 10)
        );

      if (draggedNode.id.startsWith('card-')) {
        const clickInfo = nodeClickRef.current;
        if (
          clickInfo.node?.id === draggedNode.id &&
          clickInfo.button === 0 &&
          clickInfo.startPosition
        ) {
          const nodePositionChanged =
            Math.abs(draggedNode.position.x - clickInfo.startPosition.x) > 1 ||
            Math.abs(draggedNode.position.y - clickInfo.startPosition.y) > 1;

          if (!nodePositionChanged) {
            const nodeData = draggedNode.data as unknown as Card;
            if (
              nodeData?.type === 'widget' &&
              nodeData?.meta?.widgetType === 'ticker_adder'
            ) {
              openForBoardTicker(nodeData.id as number, boardId);
              nodeClickRef.current = { ...EMPTY_CLICK_INFO };
              if (!lastPosition) {
                lastSavedPositions.current.set(draggedNode.id, currentPosition);
              }
              return;
            }

            // Create synthetic event that preserves the MouseEvent prototype
            // while overriding coordinates from clickInfo (drag-stop event coords may differ)
            const syntheticEvent = Object.create(event, {
              shiftKey: { value: event.shiftKey },
              button: { value: 0 },
              clientX: { value: clickInfo.startX },
              clientY: { value: clickInfo.startY },
            }) as React.MouseEvent;

            selectCardFromNode(syntheticEvent, draggedNode);

            if (!lastPosition) {
              lastSavedPositions.current.set(draggedNode.id, currentPosition);
            }

            nodeClickRef.current = { ...EMPTY_CLICK_INFO };
            return;
          }
        }
      }

      const positionChanged =
        !lastPosition ||
        lastPosition.x !== currentPosition.x ||
        lastPosition.y !== currentPosition.y;

      if (positionChanged) {
        // Save positions of all selected cards, not just the dragged one
        // ReactFlow moves all selected nodes together during multi-drag
        const selectedNodeIds2 = new Set(
          selectedCards.map((id) => `card-${id}`)
        );
        const currentNodes = useBoardStore.getState().nodes;
        const allMovedNodes = wasSelected
          ? currentNodes.filter((n) => selectedNodeIds2.has(n.id))
          : [draggedNode];
        saveNodePositions(allMovedNodes);

        if (draggedNode.id.startsWith('card-')) {
          const cardId = parseInt(draggedNode.id.replace('card-', ''), 10);
          trackEvent('note_drag', {
            board_id: boardId,
            card_id: cardId,
            x: Math.round(draggedNode.position.x),
            y: Math.round(draggedNode.position.y),
          });
        }
      }

      // Show menu and outline back after drag ends, if card was selected
      // This works for single card and for group of selected cards
      if (wasSelected) {
        if (selectionUpdateTimeoutRef.current) {
          clearTimeout(selectionUpdateTimeoutRef.current);
        }

        // Use delay to recalculate outline position after all cards have settled
        // This is especially important during multi-drag, when cards may "jitter" after drag ends
        selectionUpdateCancelledRef.current = false;
        selectionUpdateTimeoutRef.current = setTimeout(() => {
          // Use requestAnimationFrame to update outline position after ReactFlow updates DOM
          // Double requestAnimationFrame ensures that DOM is fully updated after drag
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (selectionUpdateCancelledRef.current) return;
              onSelectionUiUpdate?.();
              selectionUpdateTimeoutRef.current = null;
            });
          });
        }, 150);
      } else {
        // If card was not selected, ensure menu and outline are hidden
      }
    },
    [
      saveNodePositions,
      onSelectionUiUpdate,
      selectedCards,
      nodeClickRef,
      selectCardFromNode,
      trackEvent,
      boardId,
      openForBoardTicker,
      onDropCardsToChat,
      isDragging,
      chatDropZoneRef,
      lastSavedPositions,
      selectionUpdateTimeoutRef,
      selectionUpdateCancelledRef,
    ]
  );

  return {
    saveNodePositions,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
};

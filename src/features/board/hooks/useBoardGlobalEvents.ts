/**
 * useBoardGlobalEvents.ts - Global event listeners and context menu for the board
 *
 * Handles:
 * - createNote event (from sidebar button)
 * - createAiScreener event (from sidebar button)
 * - createStrategyWidget event (from strategy widget catalog)
 * - Browser context menu suppression on the board area
 * - Root context menu handler (right-click on empty canvas)
 */

import { useCallback, useEffect, useRef } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getFlowCenterPosition,
  panToCreatedCard,
} from '@/features/board/utils/viewportUtils';
import { STRATEGY_WIDGETS } from '@/features/board/components/StrategyWidgetCatalog';
import { boardQueryKeys } from '@/features/board/queries';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { edgeApi } from '@/services/api/edges';
import { useBoardStore } from '@/stores/boardStore';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import { showInfoToast } from '@/shared/utils/toast';
import { isEditableElement } from '@/shared/utils/dom';
import { CardType } from '@/types';
import { useYandexMetrika } from '@/shared/hooks';
import type { YmBoardType } from '@/features/board/utils/ymBoardType';

interface UseBoardGlobalEventsConfig {
  boardId: number;
  /** Board template from API — maps to YM board_type. */
  ymBoardType: YmBoardType;
  actions: ReturnType<typeof useBoardActions>;
  reactFlowInstance: ReactFlowInstance;
  openCreateDialog: (
    config?: Partial<{ createType: 'card'; cardType: CardType }>
  ) => void;
  openContextMenu: (x: number, y: number) => void;
  contextMenuOpen: boolean;
  highlightNodes: (nodeIds: string[]) => void;
  clearCardSelection: () => void;
}

export const useBoardGlobalEvents = ({
  boardId,
  ymBoardType,
  actions,
  reactFlowInstance,
  openCreateDialog,
  openContextMenu,
  contextMenuOpen,
  highlightNodes,
  clearCardSelection,
}: UseBoardGlobalEventsConfig) => {
  const { t } = useTranslation('board');
  const queryClient = useQueryClient();
  const { trackEvent } = useYandexMetrika();

  // createNote event
  useEffect(() => {
    const handleCreateNote = () => {
      openCreateDialog({ createType: 'card', cardType: 'note' });
    };
    window.addEventListener('createNote', handleCreateNote);
    return () => {
      window.removeEventListener('createNote', handleCreateNote);
    };
  }, [openCreateDialog]);

  // createAiScreener event
  useEffect(() => {
    const handleCreateAiScreener = async () => {
      const currentNodes = useBoardStore.getState().nodes;
      const strategyNode = currentNodes.find(
        (n) => n.data?.type === 'strategy'
      );

      let position: { x: number; y: number };
      if (strategyNode) {
        position = {
          x: Math.round(strategyNode.position.x - 336 - 120 - 200),
          y: Math.round(strategyNode.position.y + 300),
        };
      } else {
        position = getFlowCenterPosition(reactFlowInstance, {
          width: 336,
          height: 420,
        });
      }

      try {
        const createdCard = await actions.createCard(
          {
            boardId,
            title: t('cardContent.aiScreener'),
            content: '',
            type: 'widget',
            meta: { widgetType: 'ai_screener' },
            width: 336,
            height: 420,
          },
          position
        );

        if (createdCard) {
          trackEvent('board_widget_create', {
            board_id: boardId,
            board_type: ymBoardType,
            widget_type: 'ticker',
          });

          panToCreatedCard(reactFlowInstance, createdCard);
        }

        if (strategyNode && createdCard) {
          const strategyCardId = parseInt(
            strategyNode.id.replace('card-', ''),
            10
          );

          try {
            await edgeApi.createEdge({
              sourceCardId: createdCard.id,
              targetCardId: strategyCardId,
              edgeType: 'port',
              meta: {
                sourceHandle: 'output_signal_0',
                targetHandle: 'input_any_0',
              },
            });
          } catch {
            // Edge creation failed silently
          }

          // Cancel stale in-flight edges request (triggered by createCard invalidation)
          // so refetchQueries actually hits the server and picks up the new edge
          await queryClient.cancelQueries({
            queryKey: boardQueryKeys.edges(),
          });
          await queryClient.refetchQueries({
            queryKey: boardQueryKeys.edges(),
          });
        }
      } catch {
        // Card creation error already handled in useBoardActions
      }
    };
    window.addEventListener('createAiScreener', handleCreateAiScreener);
    return () => {
      window.removeEventListener('createAiScreener', handleCreateAiScreener);
    };
  }, [
    actions,
    boardId,
    ymBoardType,
    reactFlowInstance,
    queryClient,
    t,
    trackEvent,
  ]);

  // createStrategyWidget event
  useEffect(() => {
    const handleCreateStrategyWidget = async (event: Event) => {
      const { widgetType } = (event as CustomEvent).detail;
      if (!widgetType) return;

      if (widgetType === 'strategy') {
        const position = getFlowCenterPosition(reactFlowInstance);
        const widget = STRATEGY_WIDGETS.find((w) => w.type === widgetType);
        const title = widget ? (t as TranslateFn)(widget.labelKey) : widgetType;

        try {
          const createdCard = await actions.createCard(
            { boardId, title, content: '', type: 'strategy' },
            position
          );
          if (createdCard) {
            trackEvent('board_widget_create', {
              board_id: boardId,
              board_type: ymBoardType,
              widget_type: 'strategy',
            });

            panToCreatedCard(reactFlowInstance, createdCard);
          }
        } catch {
          // Card creation error already handled in useBoardActions
        }
      } else if (widgetType === 'screener_forecast') {
        const position = getFlowCenterPosition(reactFlowInstance, {
          width: 336,
          height: 420,
        });
        const widget = STRATEGY_WIDGETS.find((w) => w.type === widgetType);
        const title = widget ? (t as TranslateFn)(widget.labelKey) : widgetType;

        try {
          const createdCard = await actions.createCard(
            {
              boardId,
              title,
              content: '',
              type: 'widget',
              meta: { widgetType: 'screener_forecast' },
              width: 336,
              height: 420,
            },
            position
          );
          if (createdCard) {
            trackEvent('board_widget_create', {
              board_id: boardId,
              board_type: ymBoardType,
              widget_type: 'strategy',
            });

            panToCreatedCard(reactFlowInstance, createdCard);
          }
        } catch {
          // Card creation error already handled in useBoardActions
        }
      } else {
        const widget = STRATEGY_WIDGETS.find((w) => w.type === widgetType);
        const label = widget ? (t as TranslateFn)(widget.labelKey) : widgetType;
        showInfoToast(`${label}: ${t('toast.comingSoon')}`);
      }
    };
    window.addEventListener('createStrategyWidget', handleCreateStrategyWidget);
    return () => {
      window.removeEventListener(
        'createStrategyWidget',
        handleCreateStrategyWidget
      );
    };
  }, [actions, boardId, ymBoardType, reactFlowInstance, t, trackEvent]);

  // Ref for openContextMenu — so that the global handler is not recreated on every render
  const openContextMenuRef = useRef(openContextMenu);
  openContextMenuRef.current = openContextMenu;

  // Global handler for suppressing the browser context menu on the board area.
  // Registered in both phases (capture + bubble) for cross-browser compatibility:
  // some Chromium-based browsers (Yandex, Opera) do not always respond to
  // preventDefault() in the capture phase.
  useEffect(() => {
    const shouldPrevent = (target: HTMLElement | null): boolean => {
      if (isEditableElement(target)) return false;
      return !!(
        target?.closest('.lmx__home__main-container') ||
        target?.closest('.MuiBackdrop-root')
      );
    };

    // Capture phase: early interception before React handlers.
    // Only preventDefault, without stopPropagation — React handlers should work.
    const handleCapture = (event: MouseEvent) => {
      if (shouldPrevent(event.target as HTMLElement | null)) {
        event.preventDefault();
      }
    };
    // Bubble phase: final safety net after React handlers.
    // Also handles MUI Backdrop — reopens the custom menu in a new position.
    const handleBubble = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!shouldPrevent(target)) return;
      event.preventDefault();
      if (target?.closest('.MuiBackdrop-root')) {
        openContextMenuRef.current(event.clientX, event.clientY);
      }
    };

    document.addEventListener('contextmenu', handleCapture, true);
    document.addEventListener('contextmenu', handleBubble, false);

    return () => {
      document.removeEventListener('contextmenu', handleCapture, true);
      document.removeEventListener('contextmenu', handleBubble, false);
    };
  }, []);

  // Stable refs for the root context menu handler to avoid re-creating the callback
  const contextMenuOpenRef = useRef(contextMenuOpen);
  contextMenuOpenRef.current = contextMenuOpen;
  const highlightNodesRef = useRef(highlightNodes);
  highlightNodesRef.current = highlightNodes;
  const clearCardSelectionRef = useRef(clearCardSelection);
  clearCardSelectionRef.current = clearCardSelection;

  /**
   * Context menu handler for the "empty field" of the board.
   * Ignores clicks on cards and editable elements
   * and opens its own context menu at the cursor coordinates.
   */
  const handleRootContextMenu = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement | null;

    // Ignore events from portalled elements (e.g. TradeContextMenu) that bubble
    // through the React tree but whose DOM target is outside the board container.
    if (!target?.closest('[data-board-container]')) {
      return;
    }

    // For editables — native browser menu is needed (copy/paste), don't block.
    if (isEditableElement(target)) {
      return;
    }

    // If the click was on a ReactFlow node (card), let onNodeContextMenu
    // handle it fully. That handler already calls preventDefault, so no need here.
    const nodeElement = target?.closest('.react-flow__node');
    if (nodeElement) {
      return;
    }

    // For pane/canvas clicks: block browser context menu and open the custom one.
    // Must be called after node check but before any further early returns —
    // on Windows the React handler is the last line of defense if the document
    // capture phase didn't fire for pane clicks.
    event.preventDefault();
    event.stopPropagation();

    if (contextMenuOpenRef.current) {
      return;
    }

    highlightNodesRef.current([]);
    clearCardSelectionRef.current();
    openContextMenuRef.current(event.clientX, event.clientY);
  }, []);

  return { handleRootContextMenu };
};

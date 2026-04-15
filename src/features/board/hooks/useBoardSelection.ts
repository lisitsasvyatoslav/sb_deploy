import { useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useCardSelectionStore } from '@/stores/cardSelectionStore';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { useBoardStore } from '@/stores/boardStore';

/**
 * useBoardSelection.ts - Board selection orchestration hook
 *
 * Functions:
 * - useBoardSelection({ nodes, setNodes })               Main hook: selection state + UI + global mouse listeners
 * - highlightNodes(nodeIds)                              Applies selected state to ReactFlow nodes (manual selection)
 * - getCardsInSelection(rect)                            Returns card node ids inside rectangular selection (screen coords)
 * - recalcSelectionUI({ nodeIds?, cardIds? }?)           Recomputes toolbar and group outline position from selected cards
 * - selectCardFromNode(event, node)                      Single entry point for click / Shift+click card selection
 * - global mousedown / mousemove / mouseup handlers      Track click vs drag lifecycle for card nodes
 *
 * Responsibilities:
 * - useBoardSelection({ nodes, setNodes })
 *   - Хранит состояние:
 *     - selectedCards (через useCardSelection)
 *     - selectionBox (прямоугольник выделения ПКМ)
 *     - toolbarState (тулбар над выбранными карточками)
 *     - groupOutline (обводка группы карточек)
 *   - Синхронизирует:
 *     - selectedCards ↔ ReactFlow nodes (highlightNodes)
 *     - выбранные карточки ↔ DOM координаты (recalcSelectionUI)
 *   - Обрабатывает:
 *     - глобальные mousedown/mousemove/mouseup (клик vs drag по карточке)
 *     - selectCardFromNode (Shift‑выделение и одиночный клик)
 */

interface UseBoardSelectionConfig {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
}

const getViewportScale = () => {
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) return 1;

  const transform = getComputedStyle(viewport).transform;
  if (!transform || transform === 'none') return 1;

  const matrix2dMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrix2dMatch) {
    const [a] = matrix2dMatch[1]
      .split(',')
      .map((value) => Number.parseFloat(value));
    return Number.isFinite(a) ? a : 1;
  }

  const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3dMatch) {
    const values = matrix3dMatch[1]
      .split(',')
      .map((value) => Number.parseFloat(value));
    return Number.isFinite(values[0]) ? values[0] : 1;
  }

  return 1;
};

/**
 * Надстройка над useCardSelection, которая знает про ReactFlow и DOM:
 * - хранит состояние прямоугольного выделения и UI тулбара/рамки
 * - синхронизирует selectedCards ↔ ReactFlow nodes
 * - вешает глобальные слушатели мыши для корректной обработки клик vs drag
 */
export const useBoardSelection = ({
  nodes,
  setNodes,
}: UseBoardSelectionConfig) => {
  // Card selection state from Zustand store
  const selectedCards = useCardSelectionStore((s) => s.selectedCards);
  const setSelectedCards = useCardSelectionStore((s) => s.setSelectedCards);

  // Stable ref for nodes to avoid re-attaching global event listeners on every nodes change
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Служебные ref для прямоугольного выделения ПКМ
  const selectionRef = useRef<{
    isSelecting: boolean;
    start: { x: number; y: number } | null;
  }>({ isSelecting: false, start: null });

  // Информация о последнем клике по карточке
  const nodeClickRef = useRef<{
    node: Node | null;
    button: number;
    startX: number;
    startY: number;
    startPosition: { x: number; y: number } | null;
    wasDragged: boolean;
  }>({
    node: null,
    button: -1,
    startX: 0,
    startY: 0,
    startPosition: null,
    wasDragged: false,
  });

  // Board UI state setters from Zustand store (only setters — values not needed here)
  const setToolbarState = useBoardUIStore((s) => s.setToolbarState);
  const setGroupOutline = useBoardUIStore((s) => s.setGroupOutline);

  /**
   * Подсветка указанных нод как выбранных в ReactFlow.
   * Автоматическое выделение ReactFlow отключено, поэтому состояние selection
   * управляется полностью вручную.
   */
  const highlightNodes = useCallback(
    (nodeIds: string[]) => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          selected: nodeIds.includes(node.id),
          selectable: false,
        }))
      );
    },
    [setNodes]
  );

  /**
   * Возвращает id карточек, попадающих в прямоугольник выделения по экранным координатам.
   */
  const getCardsInSelection = useCallback(
    (rect: { left: number; top: number; right: number; bottom: number }) => {
      const elements =
        document.querySelectorAll<HTMLElement>('.react-flow__node');
      const selectedNodeIds: string[] = [];

      elements.forEach((element) => {
        const nodeRect = element.getBoundingClientRect();
        const intersects = !(
          rect.right < nodeRect.left ||
          rect.left > nodeRect.right ||
          rect.bottom < nodeRect.top ||
          rect.top > nodeRect.bottom
        );

        if (intersects) {
          const nodeId = element.getAttribute('data-id');
          if (nodeId && nodeId.startsWith('card-')) {
            selectedNodeIds.push(nodeId);
          }
        }
      });

      return selectedNodeIds;
    },
    []
  );

  /**
   * Пересчитывает позицию тулбара и рамки группового выделения
   * по текущему набору выбранных карточек.
   *
   * Важно: расчёт откладывается через requestAnimationFrame,
   * чтобы DOM успел обновиться после перемещения нод ReactFlow.
   */
  const recalcSelectionUI = useCallback(
    (override?: { nodeIds?: string[]; cardIds?: number[] }) => {
      const overrideCardIds = override?.cardIds;
      const overrideNodeIds = override?.nodeIds;

      requestAnimationFrame(() => {
        const currentNodes = useBoardStore.getState().nodes;
        const currentSelectedCards =
          useCardSelectionStore.getState().selectedCards;
        const cardIds = overrideCardIds ?? currentSelectedCards;

        if (!cardIds || cardIds.length === 0) {
          setToolbarState((prev) => ({ ...prev, visible: false }));
          setGroupOutline((prev) => ({ ...prev, visible: false }));
          return;
        }

        const selectedNodeIds =
          overrideNodeIds ??
          currentNodes
            .filter((node) => {
              if (!node.id.startsWith('card-')) return false;
              const idNum = parseInt(node.id.replace('card-', ''), 10);
              return cardIds.includes(idNum);
            })
            .map((node) => node.id);

        if (selectedNodeIds.length === 0) {
          setToolbarState((prev) => ({ ...prev, visible: false }));
          setGroupOutline((prev) => ({ ...prev, visible: false }));
          return;
        }

        const domNodes = selectedNodeIds
          .map((id) =>
            document.querySelector<HTMLElement>(
              `.react-flow__node[data-id="${id}"]`
            )
          )
          .filter(Boolean) as HTMLElement[];

        if (domNodes.length === 0) {
          setToolbarState((prev) => ({ ...prev, visible: false }));
          setGroupOutline((prev) => ({ ...prev, visible: false }));
          return;
        }

        const rects = domNodes.map((el) => el.getBoundingClientRect());
        const left = Math.min(...rects.map((r) => r.left));
        const right = Math.max(...rects.map((r) => r.right));
        const top = Math.min(...rects.map((r) => r.top));
        const bottom = Math.max(...rects.map((r) => r.bottom));

        const TOOLBAR_HEIGHT = 40;
        const GAP = 10;
        const zoom = getViewportScale();
        const borderWidth = Math.max(1, 2 * zoom);
        const outlineInset = borderWidth / 2 - 5 * zoom;

        const toolbarStateNext = {
          visible: true,
          x: left + (right - left) / 2,
          y: top - GAP - TOOLBAR_HEIGHT,
        } as const;

        const groupOutlineNext = {
          visible: cardIds.length > 1,
          left: left + outlineInset,
          top: top + outlineInset,
          width: right - left - outlineInset * 2,
          height: bottom - top - outlineInset * 2,
          borderWidth,
          borderRadius: 8 * zoom,
        };

        setToolbarState(toolbarStateNext);
        setGroupOutline(groupOutlineNext);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Единая точка входа для изменения выделения по клику по ноде.
   * Само событие клика детектится глобальным mouseup, чтобы не ломать drag.
   */
  const selectCardFromNode = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (!node.id.startsWith('card-')) {
        return;
      }

      const cardId = parseInt(node.id.replace('card-', ''), 10);

      const currentSelectedCards = selectedCards;
      let nextSelectedCards: number[];

      if (event.shiftKey) {
        const alreadySelected = currentSelectedCards.includes(cardId);
        nextSelectedCards = alreadySelected
          ? currentSelectedCards.filter((id) => id !== cardId)
          : [...currentSelectedCards, cardId];
      } else {
        nextSelectedCards = [cardId];
      }

      setSelectedCards(nextSelectedCards);

      const nextSelectedNodeIds = nextSelectedCards.map((id) => `card-${id}`);
      highlightNodes(nextSelectedNodeIds);

      recalcSelectionUI({
        nodeIds: nextSelectedNodeIds,
        cardIds: nextSelectedCards,
      });
    },
    [selectedCards, setSelectedCards, highlightNodes, recalcSelectionUI]
  );

  // Глобальный mousedown: сохраняем информацию о клике по карточке
  useEffect(() => {
    const handleGlobalMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const nodeElement = target?.closest('.react-flow__node');

      if (!nodeElement) {
        return;
      }

      const nodeId = nodeElement.getAttribute('data-id');
      if (!nodeId || !nodeId.startsWith('card-')) {
        return;
      }

      // Left-click selects only via header (card-select-zone);
      // right-click selects from anywhere on the card.
      if (event.button === 0 && !target?.closest('.card-select-zone')) {
        return;
      }

      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node) {
        return;
      }

      nodeClickRef.current = {
        node,
        button: event.button,
        startX: event.clientX,
        startY: event.clientY,
        startPosition: { x: node.position.x, y: node.position.y },
        wasDragged: false,
      };
    };

    document.addEventListener('mousedown', handleGlobalMouseDown, true);

    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown, true);
    };
  }, []);

  // Глобальный mousemove: отмечаем, что мышь действительно двигалась (drag)
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      const clickInfo = nodeClickRef.current;

      if (!clickInfo.node || !clickInfo.node.id.startsWith('card-')) {
        return;
      }

      if (!(event.buttons & (1 << clickInfo.button))) {
        return;
      }

      const deltaX = Math.abs(event.clientX - clickInfo.startX);
      const deltaY = Math.abs(event.clientY - clickInfo.startY);
      const hasMoved = deltaX > 4 || deltaY > 4;

      if (hasMoved && !clickInfo.wasDragged) {
        nodeClickRef.current.wasDragged = true;
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, true);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
    };
  }, []);

  // Stable ref for selectCardFromNode to avoid re-attaching mouseup listener
  const selectCardFromNodeRef = useRef(selectCardFromNode);
  selectCardFromNodeRef.current = selectCardFromNode;

  // Глобальный mouseup: финальное решение, был ли клик по карточке
  useEffect(() => {
    const resetClickRef = () => {
      nodeClickRef.current = {
        node: null,
        button: -1,
        startX: 0,
        startY: 0,
        startPosition: null,
        wasDragged: false,
      };
    };

    const handleGlobalMouseUp = (event: MouseEvent) => {
      const clickInfo = nodeClickRef.current;

      if (!clickInfo.node || !clickInfo.node.id.startsWith('card-')) {
        return;
      }

      if (clickInfo.button !== event.button) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const nodeElement = target?.closest('.react-flow__node');

      if (!nodeElement) {
        resetClickRef();
        return;
      }

      const nodeId = nodeElement.getAttribute('data-id');

      if (nodeId !== clickInfo.node.id) {
        resetClickRef();
        return;
      }

      const deltaX = Math.abs(event.clientX - clickInfo.startX);
      const deltaY = Math.abs(event.clientY - clickInfo.startY);
      const hasMoved = deltaX > 4 || deltaY > 4;

      const nodeToFind = clickInfo.node;
      const currentNode = nodeToFind
        ? nodesRef.current.find((n) => n.id === nodeToFind.id)
        : null;
      const nodePositionChanged =
        currentNode &&
        clickInfo.startPosition &&
        (Math.abs(currentNode.position.x - clickInfo.startPosition.x) > 1 ||
          Math.abs(currentNode.position.y - clickInfo.startPosition.y) > 1);

      if (hasMoved || nodePositionChanged) {
        resetClickRef();
        return;
      }

      const syntheticEvent = {
        ...event,
        shiftKey: event.shiftKey,
        button: event.button,
      } as unknown as React.MouseEvent;

      selectCardFromNodeRef.current(syntheticEvent, clickInfo.node);
      resetClickRef();
    };

    document.addEventListener('mouseup', handleGlobalMouseUp, true);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp, true);
    };
  }, []);

  return {
    selectionRef,
    nodeClickRef,
    highlightNodes,
    getCardsInSelection,
    recalcSelectionUI,
    selectCardFromNode,
  };
};

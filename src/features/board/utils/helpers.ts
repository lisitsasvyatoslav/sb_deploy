import {
  resolvePortConfig,
  expandDynamicInputs,
  isPortEnabledCardType,
} from '@/features/board/ports';
import { BoardFullData, Card } from '@/types';
import { Edge, Node } from '@xyflow/react';

/**
 * Преобразует данные доски в nodes для ReactFlow
 */
export const convertBoardDataToNodes = (
  boardData: BoardFullData,
  edges: Edge[]
): Node[] => {
  if (!boardData || !boardData.cards) return [];

  const nodes: Node[] = [];

  // Центральная позиция для новых элементов
  const { centerX, centerY } = calculateCenterPosition(boardData);

  // Обрабатываем все карточки
  boardData.cards.forEach((card: Card) => {
    const nodeId = `card-${card.id}`;

    // Read dimensions from Card (width/height fields) with fallback to meta.layout for backwards compatibility
    const defaultHeight = 280;
    const width = card.width || card.meta?.layout?.width || 336;
    const height = card.height || card.meta?.layout?.height || defaultHeight;

    nodes.push({
      id: nodeId,
      type: 'cardNode',
      position: {
        x: card.x ?? centerX + (Math.random() - 0.5) * 200,
        y: card.y ?? centerY + (Math.random() - 0.5) * 200,
      },
      style: {
        width,
        height,
      },
      dragHandle: '.card-drag-handle',
      selectable: false, // Выделение управляется вручную через highlightNodes
      data: {
        ...card,
        dimensions: {
          width,
          height,
        },
        // Port system: precompute resolved ports for widget / strategy cards
        resolvedPorts: isPortEnabledCardType(card.type)
          ? expandDynamicInputs(
              resolvePortConfig(card),
              card.type,
              getConnectedHandleIds(nodeId, edges)
            )
          : undefined,
      },
    });
  });

  return nodes;
};

/** Collects all handle IDs connected to a given node */
function getConnectedHandleIds(nodeId: string, edges: Edge[]): Set<string> {
  const ids = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId && edge.sourceHandle) ids.add(edge.sourceHandle);
    if (edge.target === nodeId && edge.targetHandle) ids.add(edge.targetHandle);
  }
  return ids;
}

/**
 * Вычисляет центральную позицию для размещения новых элементов
 */
export const calculateCenterPosition = (
  boardData: BoardFullData
): { centerX: number; centerY: number } => {
  if (!boardData || !boardData.cards || boardData.cards.length === 0) {
    return { centerX: 400, centerY: 300 };
  }

  const totalElements = boardData.cards.length;

  if (totalElements === 0) {
    return { centerX: 400, centerY: 300 };
  }

  const baseX = 400;
  const baseY = 300;
  const spread = Math.min(totalElements * 50, 500);

  return {
    centerX: baseX + (Math.random() - 0.5) * spread,
    centerY: baseY + (Math.random() - 0.5) * spread,
  };
};

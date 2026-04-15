import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { useContextMenuState } from '@/shared/hooks/useContextMenuState';
import { Card } from '@/types';
import React, { RefObject } from 'react';
import { Node } from '@xyflow/react';

export const EMPTY_CLICK_INFO = {
  node: null,
  button: -1,
  startX: 0,
  startY: 0,
  startPosition: null,
  wasDragged: false,
};

export interface SelectionAPI {
  nodeClickRef: RefObject<{
    node: Node | null;
    button: number;
    startX: number;
    startY: number;
    startPosition: { x: number; y: number } | null;
    wasDragged: boolean;
  }>;
  selectionRef: RefObject<{
    isSelecting: boolean;
    start: { x: number; y: number } | null;
  }>;
  highlightNodes: (nodeIds: string[]) => void;
  getCardsInSelection: (rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }) => string[];
  recalcSelectionUI: (override?: {
    nodeIds?: string[];
    cardIds?: number[];
  }) => void;
  selectCardFromNode: (event: React.MouseEvent, node: Node) => void;
}

export interface BoardCallbacks {
  onOpenNewsPreview: (card: Card) => void;
  onOpenFilePreview: (card: Card) => void;
  onOpenEditDialog: (card: Card) => void;
  onSelectionUiUpdate?: () => void;
  handleToolbarDelete: () => void;
  onDropCardsToChat?: (cardIds: number[]) => void;
}

export interface UseBoardHandlersConfig {
  boardId: number;
  nodes: Node[];
  actions: ReturnType<typeof useBoardActions>;
  contextMenuState: ReturnType<typeof useContextMenuState>;
  selection: SelectionAPI;
  callbacks: BoardCallbacks;
}

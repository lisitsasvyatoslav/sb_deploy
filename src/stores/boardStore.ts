import { convertBoardDataToNodes } from '@/features/board/utils/helpers';
import { clearPendingPositions } from '@/features/board/utils/cardPositioning';
import { BoardFullData, Card } from '@/types';
import { logger } from '@/shared/utils/logger';
import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import { create } from 'zustand';
import { useCardSelectionStore } from './cardSelectionStore';
import { useBoardUIStore } from './boardUIStore';
import { useCardModalStore } from './cardModalStore';

// Module-level drag tracking for multi-node drag (outside Zustand to avoid re-renders)
let _activeDragNodeId: string | null = null;
let _dragStartPositions: Map<string, { x: number; y: number }> = new Map();

export const setActiveDrag = (
  nodeId: string,
  startPositions: Map<string, { x: number; y: number }>
) => {
  _activeDragNodeId = nodeId;
  _dragStartPositions = startPositions;
};

export const clearActiveDrag = () => {
  _activeDragNodeId = null;
  _dragStartPositions = new Map();
};

export const getActiveDragStartPositions = () => _dragStartPositions;

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface BoardState {
  boardId: number | null;
  setBoardId: (boardId: number) => void;

  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;

  allCards: Card[];
  setAllCards: (cards: Card[]) => void;

  viewport: Viewport | null;
  saveViewport: (viewport: Viewport) => void;

  isDragOver: boolean;
  setIsDragOver: (isDragOver: boolean) => void;

  showMiniMap: boolean;
  setShowMiniMap: (show: boolean) => void;
  toggleMiniMap: () => void;

  initializeBoardData: (boardData: BoardFullData, edges: Edge[]) => void;
  resetBoard: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardId: null,
  setBoardId: (boardId: number) => set({ boardId }),

  nodes: [],
  edges: [],
  setNodes: (nodes) =>
    set({
      nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes,
    }),
  setEdges: (edges) =>
    set({
      edges: typeof edges === 'function' ? edges(get().edges) : edges,
    }),
  onNodesChange: (changes) => {
    let filteredChanges = changes.filter(
      (change: NodeChange) => change.type !== 'select'
    );

    // During multi-drag: only apply the dragged node's position changes from ReactFlow.
    // Other selected nodes' positions are updated manually in onNodeDrag handler
    // to avoid jitter from the controlled-mode sync cycle.
    if (_activeDragNodeId && _dragStartPositions.size > 1) {
      filteredChanges = filteredChanges.filter((change) => {
        if (change.type === 'position' && change.dragging) {
          return change.id === _activeDragNodeId;
        }
        return true;
      });
    }

    if (filteredChanges.length === 0) {
      return;
    }
    const { nodes } = get();
    const updatedNodes = applyNodeChanges(filteredChanges, nodes);
    set({ nodes: updatedNodes });
  },
  onEdgesChange: (changes) => {
    const { edges } = get();
    const updatedEdges = applyEdgeChanges(changes, edges);
    set({ edges: updatedEdges });
  },

  allCards: [],
  setAllCards: (cards: Card[]) => set({ allCards: cards }),

  viewport: null,
  saveViewport: (viewport: Viewport) => {
    try {
      set({ viewport });

      const { boardId } = get();
      if (boardId) {
        const key = `board-${boardId}-viewport`;
        localStorage.setItem(key, JSON.stringify(viewport));
      }
    } catch (error) {
      logger.error('boardStore', 'Viewport save error', error);
    }
  },
  isDragOver: false,
  setIsDragOver: (isDragOver: boolean) => set({ isDragOver }),

  showMiniMap: false,
  setShowMiniMap: (show: boolean) => set({ showMiniMap: show }),
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),

  initializeBoardData: (boardData: BoardFullData, edges: Edge[]) => {
    const { nodes: prevNodes } = get();
    const selectedIds = new Set(
      prevNodes.filter((n) => n.selected).map((n) => n.id)
    );
    const nodes = convertBoardDataToNodes(boardData, edges);
    const nodesWithSelection =
      selectedIds.size > 0
        ? nodes.map((n) =>
            selectedIds.has(n.id) ? { ...n, selected: true } : n
          )
        : nodes;
    set({
      nodes: nodesWithSelection,
      edges,
      allCards: boardData.cards || [],
    });

    clearPendingPositions();
  },

  resetBoard: () => {
    useCardSelectionStore.getState().clearSelection();
    useBoardUIStore.getState().resetUI();
    useCardModalStore.getState().close();
    set({
      nodes: [],
      edges: [],
      allCards: [],
      viewport: null,
      isDragOver: false,
      showMiniMap: false,
    });
  },
}));

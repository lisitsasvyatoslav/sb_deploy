import { useTranslation } from '@/shared/i18n/client';
import { useCallback, useEffect } from 'react';
import { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { Card } from '@/types';
import { api } from '@/services/api';
import { logger } from '@/shared/utils/logger';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

interface UseKeyboardShortcutsConfig {
  hasOpenDialogs: () => boolean;
  getSelectedCards: () => Card[];
  copyCards: (cards: Card[], edges: Edge[]) => void;
  cutCards: (cards: Card[], edges: Edge[]) => void;
  pasteCards: (positions: { x: number; y: number }[]) => void;
  handleDeleteCard: (cardId: number) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  clipboard: Card[];
  clipboardEdges: Edge[];
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
}

export const useKeyboardShortcuts = (config: UseKeyboardShortcutsConfig) => {
  const { t } = useTranslation('board');
  const {
    hasOpenDialogs,
    getSelectedCards,
    copyCards,
    cutCards,
    pasteCards,
    handleDeleteCard,
    setNodes,
    setEdges,
    clipboard,
    nodes,
    edges,
    reactFlowInstance,
  } = config;

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (hasOpenDialogs()) return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const selectedCards = getSelectedCards();

      // Ctrl+C — Copy
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        if (selectedCards.length > 0) {
          const selectedCardIds = selectedCards.map(
            (card) => `card_${card.id}`
          );
          const connectedEdges = edges.filter(
            (edge) =>
              selectedCardIds.includes(edge.source) &&
              selectedCardIds.includes(edge.target)
          );
          copyCards(selectedCards, connectedEdges);
        } else {
          showErrorToast(t('keyboard.nothingToCopy'));
        }
      }

      // Ctrl+X — Cut
      if (event.ctrlKey && event.key === 'x') {
        event.preventDefault();
        if (selectedCards.length > 0) {
          const selectedCardIds = selectedCards.map(
            (card) => `card_${card.id}`
          );
          const connectedEdges = edges.filter(
            (edge) =>
              selectedCardIds.includes(edge.source) &&
              selectedCardIds.includes(edge.target)
          );
          cutCards(selectedCards, connectedEdges);
        } else {
          showErrorToast(t('keyboard.nothingToCut'));
        }
      }

      // Ctrl+V — Paste
      if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        if (clipboard.length > 0) {
          const positions = clipboard.map((card) => {
            const originalNode = nodes.find(
              (node) =>
                node.id === `card_${card.id}` || node.id === `idea_${card.id}`
            );
            return originalNode ? originalNode.position : null;
          });

          if (positions.every((pos) => pos !== null)) {
            pasteCards(positions as { x: number; y: number }[]);
          } else if (reactFlowInstance) {
            const center = {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            };
            const centerPosition =
              reactFlowInstance.screenToFlowPosition(center);
            const fallbackPositions = clipboard.map(() => centerPosition);
            pasteCards(fallbackPositions);
          }
        } else {
          showErrorToast(t('keyboard.clipboardEmpty'));
        }
      }

      // Delete / Backspace — Delete selected cards and edges
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();

        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedCards.length > 0 || selectedEdges.length > 0) {
          if (selectedCards.length > 0) {
            selectedCards.forEach((card) => {
              handleDeleteCard(card.id);
            });
            setNodes((prevNodes) => prevNodes.filter((node) => !node.selected));
          }

          if (selectedEdges.length > 0) {
            for (const edge of selectedEdges) {
              try {
                let edgeId: number;

                if (edge.id.startsWith('edge_')) {
                  edgeId = parseInt(edge.id.replace('edge_', ''));
                } else if (edge.id.startsWith('edge-')) {
                  edgeId = parseInt(edge.id.replace('edge-', ''));
                } else {
                  edgeId = parseInt(edge.id);
                }

                if (isNaN(edgeId)) {
                  logger.error(
                    'useKeyboardShortcuts',
                    'Failed to extract edge ID',
                    { edgeId: edge.id }
                  );
                  continue;
                }

                await api.deleteEdge(edgeId);
              } catch (error) {
                logger.error(
                  'useKeyboardShortcuts',
                  'Error deleting edge',
                  error
                );
              }
            }

            setEdges((prevEdges) => prevEdges.filter((edge) => !edge.selected));
          }

          const totalDeleted = selectedCards.length + selectedEdges.length;
          showSuccessToast(
            t('keyboard.deleted', {
              total: totalDeleted,
              cards: selectedCards.length,
              connections: selectedEdges.length,
            })
          );
        } else {
          showErrorToast(t('keyboard.nothingToDelete'));
        }
      }

      // Escape — Clear selection
      if (event.key === 'Escape') {
        event.preventDefault();
        setNodes((prevNodes) =>
          prevNodes.map((node) => ({ ...node, selected: false }))
        );
        setEdges((prevEdges) =>
          prevEdges.map((edge) => ({ ...edge, selected: false }))
        );
        showSuccessToast(t('keyboard.selectionCleared'));
      }
    },
    [
      t,
      hasOpenDialogs,
      getSelectedCards,
      copyCards,
      cutCards,
      pasteCards,
      clipboard,
      reactFlowInstance,
      handleDeleteCard,
      setNodes,
      setEdges,
      nodes,
      edges,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    handleKeyDown,
  };
};

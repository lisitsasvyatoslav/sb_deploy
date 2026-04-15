/**
 * useBoardDialogs.ts - Dialog state management for the board
 *
 * Manages:
 * - File preview modal (open/close, current card)
 * - Edit dialog (open/close via CreateCardDialog in edit mode)
 * - Create dialog (open/close, config, position)
 */

import { useCallback, useState } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { getFlowCenterPosition } from '@/features/board/utils/viewportUtils';
import { Card, CardType } from '@/types';

interface UseBoardDialogsConfig {
  reactFlowInstance: ReactFlowInstance;
  clearReactFlowFocus: () => void;
}

export const useBoardDialogs = ({
  reactFlowInstance,
  clearReactFlowFocus,
}: UseBoardDialogsConfig) => {
  // File preview modal state
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [filePreviewCard, setFilePreviewCard] = useState<Card | null>(null);

  const openFilePreview = useCallback((card: Card) => {
    setFilePreviewCard(card);
    setFilePreviewOpen(true);
  }, []);

  const closeFilePreview = useCallback(() => {
    setFilePreviewOpen(false);
    setFilePreviewCard(null);
  }, []);

  // Edit dialog state - uses CreateCardDialog
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogConfig, setCreateDialogConfig] = useState<{
    createType: 'card';
    cardType: CardType;
  }>({ createType: 'card', cardType: 'note' });
  const [createDialogPosition, setCreateDialogPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  const openEditDialog = useCallback((card: Card) => {
    setEditingCard(card);
    setCreateDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditingCard(null);
    setCreateDialogOpen(false);
    clearReactFlowFocus();
  }, [clearReactFlowFocus]);

  const openCreateDialog = useCallback(
    (config?: Partial<typeof createDialogConfig>) => {
      setCreateDialogConfig((prev) => ({
        createType: config?.createType || prev.createType,
        cardType: config?.cardType || prev.cardType,
      }));
      setCreateDialogPosition(getFlowCenterPosition(reactFlowInstance));
      setCreateDialogOpen(true);
    },
    [reactFlowInstance]
  );

  return {
    // Callbacks for other hooks
    openFilePreview,
    openEditDialog,
    openCreateDialog,

    // Props ready for spreading into components
    createDialogProps: {
      open: createDialogOpen,
      onClose: closeEditDialog,
      initialCreateType: createDialogConfig.createType,
      initialCardType: createDialogConfig.cardType,
      editCard: editingCard,
    },
    createDialogPosition,

    filePreviewProps: {
      open: filePreviewOpen,
      card: filePreviewCard,
      onClose: closeFilePreview,
    },
  };
};

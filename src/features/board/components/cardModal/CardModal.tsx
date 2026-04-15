'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCardModalStore } from '@/stores/cardModalStore';
import { useBoardStore } from '@/stores/boardStore';
import { useChatStore } from '@/stores/chatStore';
import { useBoardBounds } from '@/features/board/hooks/useBoardBounds';
import { useCardOperations } from '@/features/board/hooks/useCardOperations';
import { usePositionedCreateCardMutation } from '@/features/board/queries';
import { useCardHeader } from '@/features/board/hooks/useCardHeader';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalBody } from '@/shared/ui/Modal/ModalBody';
import CardControls from '@/shared/ui/CardControls';
import { CardContextMenu } from '@/features/board/components/CardContextMenu';
import DeleteCardConfirmDialog from '@/features/board/components/DeleteCardConfirmDialog';
import { DEFAULT_CARD_COLOR } from '@/features/board/components/CardSelectionToolbar';
import { DUPLICATE_CARD_X_OFFSET } from '@/features/board/constants/boardConstants';
import { REGION } from '@/shared/config/region';
import { logger } from '@/shared/utils/logger';
import { showErrorToast } from '@/shared/utils/toast';
import { useTranslation } from '@/shared/i18n/client';
import { CardModalContent } from './CardModalContent';

export function CardModal() {
  const { isOpen, cardId, boardId } = useCardModalStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const card = useBoardStore((s) =>
    cardId ? s.allCards.find((c) => c.id === cardId) : undefined
  );

  const { t } = useTranslation('board');
  const expandedBounds = useBoardBounds();
  const ops = useCardOperations(cardId, boardId);
  const createCardMutation = usePositionedCreateCardMutation();

  // ── Context menu ("..." button) ──
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { activeChatId, createChatWithCards, addCardsToActiveChat } =
    useChatManager();

  // Reset expanded state when modal closes
  useEffect(() => {
    if (!isOpen) setIsExpanded(false);
  }, [isOpen]);

  // ── Title editing state ──
  const [editTitle, setEditTitle] = useState('');
  useEffect(() => {
    if (card) {
      // On US stand, chart cards may have a Russian company name stored as title
      // from before the REGION-aware fix. Use the ticker symbol from meta instead.
      const title =
        REGION === 'us' && card.type === 'chart' && card.meta?.symbol
          ? String(card.meta.symbol)
          : card.title || '';
      setEditTitle(title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id, card?.title]);

  const handleTitleConfirm = useCallback(() => {
    ops.updateTitle(editTitle);
  }, [editTitle, ops]);

  // ── Color ──
  const handleColorChange = useCallback(
    (color: string) => {
      ops.updateColor(color);
    },
    [ops]
  );

  const colorWidget = useMemo(
    () => (
      <SelectColorWidget
        currentColor={card?.color ?? ''}
        onColorChange={handleColorChange}
      />
    ),
    [card?.color, handleColorChange]
  );

  // ── Header ──
  const handleClose = useCallback(() => {
    useCardModalStore.getState().close();
  }, []);

  const handleMore = useCallback((e: React.MouseEvent) => {
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleAskAI = useCallback(async () => {
    if (!cardId || !boardId) return;
    handleClose();
    if (activeChatId) {
      addCardsToActiveChat([cardId], boardId);
    } else {
      await createChatWithCards([cardId], undefined, undefined, boardId);
      useChatStore.getState().openSidebar();
    }
  }, [
    cardId,
    boardId,
    activeChatId,
    addCardsToActiveChat,
    createChatWithCards,
    handleClose,
  ]);

  const handleAskAIWithFile = useCallback(
    async (fileId: string, filename: string, mimeType?: string) => {
      useChatStore
        .getState()
        .setPendingChatFiles([{ fileId, filename, mimeType }]);
      handleClose();
      if (activeChatId) {
        useChatStore.getState().openSidebar();
      } else {
        await createChatWithCards([]);
        useChatStore.getState().openSidebar();
      }
    },
    [handleClose, activeChatId, createChatWithCards]
  );

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDuplicate = useCallback(async () => {
    if (!card || !boardId) return;
    try {
      const duplicate = await createCardMutation.mutateAsync({
        boardId,
        title: card.title,
        content: card.content ?? '',
        type: card.type,
        x: card.x + DUPLICATE_CARD_X_OFFSET,
        y: card.y,
        zIndex: 0,
        color: card.color ?? DEFAULT_CARD_COLOR,
      });
      handleClose();
      setTimeout(() => {
        useCardModalStore.getState().open(duplicate.id, boardId);
      }, 100);
    } catch (error) {
      logger.error('CardModal', 'Error duplicating card', error);
      showErrorToast(t('cardContextMenu.duplicateError'));
    }
  }, [card, boardId, createCardMutation, handleClose, t]);

  const handleConfirmDelete = useCallback(async () => {
    setShowDeleteConfirm(false);
    handleClose();
    await ops.deleteCard();
  }, [handleClose, ops]);

  const { headerProps } = useCardHeader(
    card,
    isExpanded ? 'fullscreen' : 'modal',
    {
      onClose: handleClose,
      onExpand: () => setIsExpanded(true),
      onCollapse: () => setIsExpanded(false),
      onTitleChange: handleTitleConfirm,
      onMore: handleMore,
    },
    {
      value: editTitle,
      onChange: setEditTitle,
      onConfirm: handleTitleConfirm,
    },
    colorWidget
  );

  // tickerLogo and ticker are now provided by useCardHeader via headerProps
  const headerElement = <CardControls {...headerProps} />;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose();
    },
    [handleClose]
  );

  if (!card || !boardId) return null;

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      expandable
      expanded={isExpanded}
      onExpandedChange={setIsExpanded}
      expandedBounds={expandedBounds}
      maxWidth="lg"
      className={isExpanded ? '' : '!h-[732px] !max-h-[calc(90vh-80px)]'}
      header={headerElement}
    >
      <ModalBody padding="none">
        <CardModalContent
          card={card}
          boardId={boardId}
          onAskAI={handleAskAI}
          onAskAIWithFile={handleAskAIWithFile}
        />
      </ModalBody>

      {contextMenuPos && (
        <CardContextMenu
          cardId={card.id}
          cardType={card.type}
          anchorPosition={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          onAskAI={handleAskAI}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      <DeleteCardConfirmDialog
        open={showDeleteConfirm}
        cardCount={1}
        signalCount={card.type === 'signal' ? 1 : 0}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}

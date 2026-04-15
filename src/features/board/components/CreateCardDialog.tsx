import { Modal } from '@/shared/ui/Modal';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';
import CardControls from '@/shared/ui/CardControls';
import DeleteCardConfirmDialog from '@/features/board/components/DeleteCardConfirmDialog';
import { DEFAULT_CARD_COLOR } from '@/features/board/components/CardSelectionToolbar';
import { DUPLICATE_CARD_X_OFFSET } from '@/features/board/constants/boardConstants';
import {
  DEFAULT_VIEWPORT,
  getViewportCenter,
  getFlowCenterPosition,
  panToCreatedCard,
} from '@/features/board/utils/viewportUtils';
import { useReactFlow } from '@xyflow/react';
import {
  usePositionedCreateCardMutation,
  useDeleteCardMutation,
  useUpdateCardMutation,
} from '@/features/board/queries';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { useBoardStore } from '@/stores/boardStore';
import { useChatStore } from '@/stores/chatStore';
import { useCardModalStore } from '@/stores/cardModalStore';
import { CardContextMenu } from '@/features/board/components/CardContextMenu';
import { Card, CardType } from '@/types';
import { logger } from '@/shared/utils/logger';
import { useBoardBounds } from '@/features/board/hooks/useBoardBounds';
import { useTranslation } from '@/shared/i18n/client';
import { useLocale } from '@/shared/i18n/locale-provider';
import { formatTime } from '@/shared/utils/timeUtils';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import type { TranslateFn } from '@/shared/i18n/settings';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface CreateCardDialogProps {
  open: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialCardType?: CardType;
  editCard?: Card | null;
}

interface FormData {
  title: string;
  content: string;
  type: CardType;
}

const CreateCardDialog: React.FC<CreateCardDialogProps> = ({
  open,
  onClose,
  initialPosition,
  initialCardType = 'note',
  editCard = null,
}) => {
  const isEditMode = !!editCard;
  const { t } = useTranslation('board');
  const { t: tCommon } = useTranslation('common');
  const { locale } = useLocale();
  const expandedBounds = useBoardBounds();

  const [formData, setFormData] = useState<FormData>({
    title: t('noteDialog.defaultTitle'),
    content: '',
    type: 'note',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedColor, setSelectedColor] =
    useState<string>(DEFAULT_CARD_COLOR);
  const editorContentRef = useRef('');
  const isDirtyRef = useRef(false);

  const createCardMutation = usePositionedCreateCardMutation();
  const updateCardMutation = useUpdateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();
  const { boardId: storeBoardId, viewport } = useBoardStore();
  const boardId = storeBoardId ?? 0;
  const reactFlowInstance = useReactFlow();
  const { trackEvent } = useYandexMetrika();
  const { createChatWithCards, addCardsToActiveChat, activeChatId } =
    useChatManager();
  const { openSidebar } = useChatStore();

  const viewportCenter = useMemo(() => {
    if (reactFlowInstance) {
      return getFlowCenterPosition(reactFlowInstance);
    }
    const center = getViewportCenter(viewport ?? DEFAULT_VIEWPORT);
    logger.info('CreateCardDialog', 'Calculated viewport center (fallback)', {
      viewport,
      center,
    });
    return center;
  }, [reactFlowInstance, viewport]);

  useEffect(() => {
    if (open) {
      setIsExpanded(false);
      setShowDeleteConfirm(false);
      setContextMenuPos(null);
      isDirtyRef.current = false;
      if (isEditMode && editCard) {
        const content = editCard.content || '';
        editorContentRef.current = content;
        setFormData({
          title: editCard.title || '',
          content,
          type: editCard.type || 'note',
        });
        setSelectedColor(editCard.color ?? DEFAULT_CARD_COLOR);
      } else {
        editorContentRef.current = '';
        setFormData({
          title: initialCardType === 'note' ? t('noteDialog.defaultTitle') : '',
          content: '',
          type: initialCardType,
        });
        setSelectedColor(DEFAULT_CARD_COLOR);
      }
    }
  }, [initialCardType, open, isEditMode, editCard, boardId, t]);

  const createCard = useCallback(async () => {
    const position = initialPosition || viewportCenter;
    const card = await createCardMutation.mutateAsync({
      boardId,
      title: formData.title,
      content: editorContentRef.current,
      type: formData.type,
      x: position.x,
      y: position.y,
      zIndex: 0,
      color: selectedColor,
    });
    trackEvent('note_create', {
      board_id: boardId,
      card_id: card.id,
      card_type: formData.type,
    });
    return card;
  }, [
    boardId,
    formData.title,
    formData.type,
    initialPosition,
    viewportCenter,
    selectedColor,
    createCardMutation,
    trackEvent,
  ]);

  const handleTitleConfirm = useCallback(async () => {
    if (!isEditMode || !editCard) return;
    try {
      await updateCardMutation.mutateAsync({
        id: editCard.id,
        boardId,
        data: { title: formData.title },
      });
      showSuccessToast(t('noteDialog.noteUpdated'));
    } catch (error) {
      logger.error('CreateCardDialog', t('noteDialog.noteUpdateError'), error);
      showErrorToast(t('noteDialog.noteUpdateError'));
    }
  }, [isEditMode, editCard, boardId, formData.title, updateCardMutation, t]);

  const handleAskAI = useCallback(async () => {
    try {
      let cardId: number;

      if (isEditMode && editCard) {
        await updateCardMutation.mutateAsync({
          id: editCard.id,
          boardId,
          data: {
            title: formData.title,
            content: editorContentRef.current,
            type: formData.type as CardType,
            color: selectedColor,
          },
        });
        cardId = editCard.id;
      } else {
        const createdCard = await createCard();
        cardId = createdCard.id;
        showSuccessToast(t('noteDialog.noteCreated'));
      }

      onClose();

      if (activeChatId) {
        addCardsToActiveChat([cardId], boardId);
      } else {
        await createChatWithCards([cardId], undefined, undefined, boardId);
        openSidebar();
      }
    } catch (error) {
      logger.error('CreateCardDialog', t('noteDialog.aiChatError'), error);
      showErrorToast(t('noteDialog.aiChatError'));
    }
  }, [
    isEditMode,
    editCard,
    boardId,
    formData.title,
    formData.type,
    selectedColor,
    createCard,
    updateCardMutation,
    createChatWithCards,
    addCardsToActiveChat,
    activeChatId,
    openSidebar,
    onClose,
    t,
  ]);

  const handleAskAIWithFile = useCallback(
    async (fileId: string, filename: string, mimeType?: string) => {
      useChatStore
        .getState()
        .setPendingChatFiles([{ fileId, filename, mimeType }]);
      onClose();
      if (activeChatId) {
        openSidebar();
      } else {
        await createChatWithCards([]);
        openSidebar();
      }
    },
    [activeChatId, createChatWithCards, openSidebar, onClose]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!isEditMode || !editCard) return;
    try {
      await deleteCardMutation.mutateAsync({ cardId: editCard.id, boardId });
      trackEvent('note_delete', { board_id: boardId, card_id: editCard.id });
      showSuccessToast(t('noteDialog.noteDeleted'));
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      logger.error('CreateCardDialog', t('noteDialog.noteDeleteError'), error);
      showErrorToast(t('noteDialog.noteDeleteError'));
    }
  }, [
    isEditMode,
    editCard,
    boardId,
    deleteCardMutation,
    trackEvent,
    onClose,
    t,
  ]);

  const handleDuplicate = useCallback(async () => {
    try {
      let originalCard: Card;
      if (isEditMode && editCard) {
        await updateCardMutation.mutateAsync({
          id: editCard.id,
          boardId,
          data: {
            title: formData.title,
            content: editorContentRef.current,
            type: formData.type as CardType,
            color: selectedColor,
          },
        });
        originalCard = editCard;
      } else {
        originalCard = await createCard();
      }

      const duplicate = await createCardMutation.mutateAsync({
        boardId,
        title: formData.title,
        content: editorContentRef.current,
        type: formData.type,
        x: originalCard.x + DUPLICATE_CARD_X_OFFSET,
        y: originalCard.y,
        zIndex: 0,
        color: selectedColor,
      });

      onClose();
      useCardModalStore.getState().open(duplicate.id, boardId);
    } catch (error) {
      logger.error('CreateCardDialog', 'Error duplicating card', error);
      showErrorToast(t('noteDialog.duplicateError'));
    }
  }, [
    isEditMode,
    editCard,
    boardId,
    formData,
    selectedColor,
    createCard,
    createCardMutation,
    updateCardMutation,
    onClose,
    t,
  ]);

  const handleContextDelete = useCallback(() => {
    if (isEditMode) {
      setShowDeleteConfirm(true);
    } else {
      onClose();
    }
  }, [isEditMode, onClose]);

  const handleMore = useCallback((e: React.MouseEvent) => {
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    editorContentRef.current = content;
    isDirtyRef.current = true;
  }, []);

  const editorConfig = useMemo(
    () => ({
      content: formData.content,
      placeholder: t('noteDialog.editorPlaceholder'),
      onChange: handleEditorChange,
    }),
    [formData.content, handleEditorChange, t]
  );

  const handleColorChange = useCallback(
    async (color: string) => {
      setSelectedColor(color);
      if (isEditMode && editCard) {
        try {
          await updateCardMutation.mutateAsync({
            id: editCard.id,
            boardId,
            data: { color },
          });
        } catch (error) {
          logger.error(
            'CreateCardDialog',
            t('noteDialog.noteUpdateError'),
            error
          );
          showErrorToast(t('noteDialog.noteUpdateError'));
        }
      }
    },
    [isEditMode, editCard, boardId, updateCardMutation, t]
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setFormData((prev) => ({ ...prev, title: newTitle }));
  }, []);

  const editableTitle = useMemo(
    () => ({
      value: formData.title,
      onChange: handleTitleChange,
      onConfirm: isEditMode ? handleTitleConfirm : undefined,
      placeholder: t('noteDialog.titlePlaceholder'),
      color: selectedColor,
    }),
    [
      formData.title,
      handleTitleChange,
      isEditMode,
      handleTitleConfirm,
      selectedColor,
      t,
    ]
  );

  const colorWidget = useMemo(
    () => (
      <SelectColorWidget
        currentColor={selectedColor}
        onColorChange={handleColorChange}
      />
    ),
    [selectedColor, handleColorChange]
  );

  const handleClose = useCallback(async () => {
    let createdCard: Awaited<ReturnType<typeof createCard>> | undefined;
    try {
      if (isEditMode && editCard) {
        if (isDirtyRef.current) {
          await updateCardMutation.mutateAsync({
            id: editCard.id,
            boardId,
            data: {
              title: formData.title,
              content: editorContentRef.current,
              type: formData.type as CardType,
              color: selectedColor,
            },
          });
          showSuccessToast(t('noteDialog.noteUpdated'));
          trackEvent('note_update', {
            board_id: boardId,
            card_id: editCard.id,
            card_type: formData.type,
          });
        }
      } else {
        const hasContent = editorContentRef.current.trim().length > 0;
        if (hasContent) {
          createdCard = await createCard();
          showSuccessToast(t('noteDialog.noteCreated'));
        }
      }
    } catch (error) {
      logger.error('CreateCardDialog', 'Error saving on close', error);
      showErrorToast(
        isEditMode
          ? t('noteDialog.noteUpdateError')
          : t('noteDialog.noteCreateError')
      );
    }
    onClose();
    if (createdCard) {
      panToCreatedCard(reactFlowInstance, createdCard);
    }
  }, [
    isEditMode,
    editCard,
    boardId,
    formData,
    selectedColor,
    createCard,
    updateCardMutation,
    trackEvent,
    onClose,
    reactFlowInstance,
  ]);

  const cardTime = useMemo(() => {
    if (!editCard?.createdAt) return undefined;
    return formatTime(editCard.createdAt, tCommon as TranslateFn, locale);
  }, [editCard?.createdAt, tCommon, locale]);

  const headerElement = useMemo(
    () => (
      <CardControls
        mode={isExpanded ? 'fullscreen' : 'modal'}
        editableLabel={editableTitle}
        colorWidget={colorWidget}
        cardType={editCard?.type ?? initialCardType}
        time={cardTime}
        onMore={handleMore}
        onExpand={
          isExpanded ? () => setIsExpanded(false) : () => setIsExpanded(true)
        }
        onClose={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      />
    ),
    [
      editableTitle,
      colorWidget,
      editCard?.type,
      initialCardType,
      cardTime,
      isExpanded,
      handleMore,
      handleClose,
    ]
  );

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        maxWidth="lg"
        className={isExpanded ? '' : '!h-[732px] !max-h-[calc(90vh-80px)]'}
        zIndex={1500}
        editorConfig={editorConfig}
        expandable
        expanded={isExpanded}
        onExpandedChange={setIsExpanded}
        expandedBounds={expandedBounds}
        onAskAIWithFile={handleAskAIWithFile}
        header={headerElement}
      >
        {null}
      </Modal>

      {contextMenuPos && (
        <CardContextMenu
          cardId={editCard?.id ?? 0}
          cardType={editCard?.type ?? initialCardType}
          anchorPosition={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          onAskAI={handleAskAI}
          onDelete={handleContextDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      {isEditMode && (
        <DeleteCardConfirmDialog
          open={showDeleteConfirm}
          cardCount={1}
          signalCount={editCard?.signalWebhookId ? 1 : 0}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};

export default CreateCardDialog;

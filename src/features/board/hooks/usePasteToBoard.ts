import { useCallback, useEffect } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { Card, CreateCardRequest } from '@/types';
import { useOGCard } from '@/shared/hooks/useOGCard';
import { useTranslation } from '@/shared/i18n/client';
import { useBoardStore } from '@/stores/boardStore';
import { useCardModalStore } from '@/stores/cardModalStore';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { getFlowCenterPosition } from '@/features/board/utils/viewportUtils';

interface UsePasteToBoardProps {
  reactFlowInstance: ReactFlowInstance;
  boardId: number;
  createCard: (
    cardData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'>,
    position: { x: number; y: number }
  ) => Promise<Card>;
  deleteCard: (cardId: number) => Promise<void>;
  uploadFile: (file: File, position: { x: number; y: number }) => Promise<Card>;
}

interface UsePasteToBoardReturn {
  onPaste: (event: ClipboardEvent) => void;
  onPasteReactFlow: (event: React.ClipboardEvent<HTMLDivElement>) => void;
}

const getFileExtension = (mimeType: string, fileName?: string): string => {
  if (fileName && fileName.includes('.')) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) return extension;
  }

  const mimeToExtension: { [key: string]: string } = {
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/html': 'html',
    'text/xml': 'xml',
    'application/json': 'json',
    'text/javascript': 'js',
    'text/css': 'css',
    'application/rtf': 'rtf',
  };

  return mimeToExtension[mimeType] || 'bin';
};

export const usePasteToBoard = ({
  reactFlowInstance,
  boardId,
  createCard,
  deleteCard,
  uploadFile,
}: UsePasteToBoardProps): UsePasteToBoardReturn => {
  const { setNodes } = useBoardStore();
  const { t } = useTranslation('board');

  const { processUrlPaste } = useOGCard({
    boardId,
    setNodes,
    handleDeleteCard: deleteCard,
    handleCardDoubleClick: (card: Card) => {
      console.log('Card double clicked:', card);
    },
    createElementWithPosition: async (
      elementData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'>,
      _elementType: 'card',
      position: { x: number; y: number }
    ) => {
      const createdCard = await createCard(elementData, position);

      return createdCard;
    },
  });

  const handlePasteData = useCallback(
    async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true' ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      // Also bail out if focus is currently in an editable element, even when
      // event.target points elsewhere (happens e.g. after clicking the React
      // Flow pane and then focusing the chat editor before pasting).
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.contentEditable === 'true' ||
          activeEl.closest('input') ||
          activeEl.closest('textarea') ||
          activeEl.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      if (useCardModalStore.getState().isOpen) return;

      // Also skip when any modal/dialog is open (e.g. CreateCardDialog).
      // useCardModalStore only tracks the expanded card view, but other modals
      // stamp [data-modal-overlay] into the DOM when mounted.
      if (document.querySelector('[data-modal-overlay]')) return;

      if (!reactFlowInstance) {
        return;
      }

      const isOverOverlay =
        target &&
        (target.closest('.chat-window') ||
          target.closest('.chat-sidebar') ||
          target.closest('.chat-manager') ||
          target.closest('.MuiDialog-root') ||
          target.closest('.MuiModal-root') ||
          target.closest('[role="dialog"]') ||
          target.closest('[data-modal-overlay]') ||
          target.closest('[data-board-overlay]') ||
          target.closest('[data-testid="chat"]') ||
          target.closest('[data-testid="chat-window"]') ||
          target.closest('[data-testid="chat-sidebar"]') ||
          target.closest('.lmx__home__sidebar') ||
          target.closest('.lmx__home__chat') ||
          target.closest('.news-sidebar') ||
          target.closest('.ask-ai-button') ||
          target.closest('.performance-monitor'));

      if (isOverOverlay) {
        return;
      }

      event.preventDefault();

      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }

      let pastePosition = { x: 400, y: 300 };

      if (reactFlowInstance) {
        pastePosition = getFlowCenterPosition(reactFlowInstance);
      }

      const textData = clipboardData.getData('text/plain');

      if (textData && textData.trim()) {
        const trimmedText = textData.trim();
        await processUrlPaste(trimmedText, pastePosition);
        return;
      }

      const items = Array.from(clipboardData.items);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      const documentItem = items.find(
        (item) =>
          item.type.startsWith('text/') ||
          item.type === 'application/pdf' ||
          item.type === 'application/msword' ||
          item.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          item.type === 'application/vnd.ms-excel' ||
          item.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          item.type === 'text/plain' ||
          item.type === 'text/csv' ||
          item.type === 'application/rtf' ||
          item.type === 'text/html' ||
          item.type === 'text/xml' ||
          item.type === 'application/json'
      );

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `screenshot-${timestamp}.png`;

            await uploadFile(file, pastePosition);
            showSuccessToast(t('toast.filePasted', { fileName }));
          } catch (error) {
            showErrorToast(t('toast.filePasteError'));
          }
        }
      } else if (documentItem) {
        const file = documentItem.getAsFile();
        if (file) {
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileExtension = getFileExtension(file.type, file.name);
            const fileName = `document-${timestamp}.${fileExtension}`;

            await uploadFile(file, pastePosition);
            showSuccessToast(t('toast.docPasted', { fileName }));
          } catch (error) {
            showErrorToast(t('toast.docPasteError'));
          }
        }
      }
    },
    [reactFlowInstance, uploadFile, processUrlPaste, t]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePasteData);
    return () => {
      document.removeEventListener('paste', handlePasteData);
    };
  }, [handlePasteData]);

  const onPasteReactFlow = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      handlePasteData(event.nativeEvent as unknown as ClipboardEvent);
    },
    [handlePasteData]
  );

  return {
    onPaste: handlePasteData,
    onPasteReactFlow,
  };
};

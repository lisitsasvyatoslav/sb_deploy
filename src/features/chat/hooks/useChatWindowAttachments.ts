import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { InlineChipData } from '@/features/chat/components/InlineChip';
import {
  AttachmentListItemData,
  AttachmentType,
} from '@/features/chat/components/Attachments';
import { isImageMimeType } from '@/features/chat/hooks/useChatFileAttachments';
import { useBoardStore } from '@/stores/boardStore';
import { useChatStore } from '@/stores/chatStore';

interface FileAttachment {
  id: string | number;
  type: string;
  name: string;
  mimeType?: string;
  fileSize?: number;
  previewUrl?: string;
}

interface AttachedTrade {
  ticker: string;
  securityId?: number;
}

interface UseChatWindowAttachmentsParams {
  inlineChips: InlineChipData[];
  setInlineChips: Dispatch<SetStateAction<InlineChipData[]>>;
  attachedFiles: FileAttachment[];
  attachedTrades: AttachedTrade[];
  onRemoveCard: ((cardId: number) => void) | null | undefined;
  handleRemoveFileAttachment: (id: string | number) => void;
  isInputAttachmentsListOpen: boolean;
}

interface UseChatWindowAttachmentsReturn {
  handleRemoveAttachment: (id: number | string, type: 'card' | 'file') => void;
  handleDeleteInputAttachment: (
    id: string | number,
    type: AttachmentType
  ) => void;
  handleOpenInputAttachmentsList: () => void;
}

export function useChatWindowAttachments({
  inlineChips,
  setInlineChips,
  attachedFiles,
  attachedTrades,
  onRemoveCard,
  handleRemoveFileAttachment,
  isInputAttachmentsListOpen,
}: UseChatWindowAttachmentsParams): UseChatWindowAttachmentsReturn {
  const { allCards: storeAllCards } = useBoardStore();
  const openAttachmentsListFn = useChatStore((s) => s.openAttachmentsList);
  const removeAllTrades = useChatStore((s) => s.removeAllTrades);

  const handleRemoveAttachment = (
    id: number | string,
    type: 'card' | 'file'
  ) => {
    if (type === 'card') {
      onRemoveCard?.(id as number);
    } else {
      handleRemoveFileAttachment(id);
    }
  };

  const handleDeleteInputAttachment = useCallback(
    (id: string | number, type: AttachmentType) => {
      switch (type) {
        case 'note':
          setInlineChips((prev) =>
            prev.filter((chip) => chip.id !== `card-${id}`)
          );
          break;
        case 'image':
          handleRemoveFileAttachment(id);
          break;
        case 'document':
          handleRemoveFileAttachment(id);
          setInlineChips((prev) =>
            prev.filter((chip) => chip.id !== `file-${id}`)
          );
          break;
        case 'ticker':
          removeAllTrades();
          break;
        case 'link':
          setInlineChips((prev) => prev.filter((chip) => chip.id !== id));
          break;
      }
    },
    [handleRemoveFileAttachment, removeAllTrades, setInlineChips]
  );

  const handleOpenInputAttachmentsList = useCallback(() => {
    if (!openAttachmentsListFn) return;

    const attachments: AttachmentListItemData[] = [];

    inlineChips
      .filter((chip) => chip.type === 'card')
      .forEach((chip) => {
        const cardId = parseInt(chip.id.replace('card-', ''), 10);
        const card = storeAllCards.find((c) => c.id === cardId);
        attachments.push({
          id: cardId,
          type: 'note',
          name: chip.label,
          createdAt: card?.createdAt || new Date().toISOString(),
          attachedAt: new Date().toISOString(),
          noteContent: card?.content,
        });
      });

    attachedFiles.forEach((file) => {
      const isImage = isImageMimeType(file.mimeType);
      attachments.push({
        id: file.id,
        type: isImage ? 'image' : 'document',
        name: file.name,
        createdAt: new Date().toISOString(),
        attachedAt: new Date().toISOString(),
        fileSize: file.fileSize,
        imageUrl: isImage ? file.previewUrl : undefined,
      });
    });

    attachedTrades.forEach((trade) => {
      attachments.push({
        id: trade.ticker,
        type: 'ticker',
        name: trade.ticker,
        ticker: trade.ticker,
        securityId: trade.securityId,
        createdAt: new Date().toISOString(),
        attachedAt: new Date().toISOString(),
      });
    });

    inlineChips
      .filter((chip) => chip.type === 'link')
      .forEach((chip) => {
        attachments.push({
          id: chip.id,
          type: 'link',
          name: chip.label,
          url: chip.url,
          createdAt: new Date().toISOString(),
          attachedAt: new Date().toISOString(),
        });
      });

    if (attachments.length > 0) {
      openAttachmentsListFn(attachments, 'input', handleDeleteInputAttachment);
    }
  }, [
    openAttachmentsListFn,
    storeAllCards,
    attachedFiles,
    attachedTrades,
    inlineChips,
    handleDeleteInputAttachment,
  ]);

  // Keep input-mode attachments panel in sync when attached items change.
  // isInputAttachmentsListOpen is intentionally NOT in deps to avoid a re-render loop
  const handleOpenInputAttachmentsListRef = useRef(
    handleOpenInputAttachmentsList
  );
  handleOpenInputAttachmentsListRef.current = handleOpenInputAttachmentsList;
  const isInputAttachmentsListOpenRef = useRef(isInputAttachmentsListOpen);
  isInputAttachmentsListOpenRef.current = isInputAttachmentsListOpen;
  useEffect(() => {
    if (isInputAttachmentsListOpenRef.current) {
      handleOpenInputAttachmentsListRef.current();
    }
  }, [attachedTrades, attachedFiles, inlineChips]);

  return {
    handleRemoveAttachment,
    handleDeleteInputAttachment,
    handleOpenInputAttachmentsList,
  };
}

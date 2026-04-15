import {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { InlineChipData } from '@/features/chat/components/InlineChip';
import { ChatInputRef } from '@/features/chat/components/ChatInput';
import {
  isImageMimeType,
  isImageFilename,
} from '@/features/chat/hooks/useChatFileAttachments';
import { useChatStore } from '@/stores/chatStore';
import { Card } from '@/types';

interface FileAttachment {
  id: string | number;
  type: string;
  name: string;
  mimeType?: string;
  fileSize?: number;
  previewUrl?: string;
}

interface UseChatWindowChipSyncParams {
  chatId: number;
  cards: Card[];
  inlineChips: InlineChipData[];
  setInlineChips: Dispatch<SetStateAction<InlineChipData[]>>;
  setMessage: Dispatch<SetStateAction<string>>;
  chatInputRef: RefObject<ChatInputRef | null>;
  attachedFiles: FileAttachment[];
  handleRemoveFileAttachment: (id: string | number) => void;
  onRemoveCard: ((cardId: number) => void) | null | undefined;
  addExternalFile: (fileId: string, filename: string, mimeType: string) => void;
}

export interface ChipSyncRefs {
  chipifiedFileIdsRef: MutableRefObject<Set<string>>;
  chipifiedCardIdsRef: MutableRefObject<Set<number>>;
}

export function useChatWindowChipSync({
  chatId,
  cards,
  inlineChips,
  setInlineChips,
  setMessage,
  chatInputRef,
  attachedFiles,
  handleRemoveFileAttachment,
  onRemoveCard,
  addExternalFile,
}: UseChatWindowChipSyncParams): ChipSyncRefs {
  const { t } = useTranslation('chat');

  const chipifiedFileIdsRef = useRef<Set<string>>(new Set());
  const chipifiedCardIdsRef = useRef<Set<number>>(new Set());
  const prevInlineChipsRef = useRef<InlineChipData[]>(inlineChips);

  // Pick up files queued by "Ask AI" on file attachments in the editor
  const pendingChatFiles = useChatStore((s) => s.pendingChatFiles);
  useEffect(() => {
    if (pendingChatFiles.length === 0) return;
    pendingChatFiles.forEach((f) => {
      addExternalFile(f.fileId, f.filename, f.mimeType ?? '');
    });
    useChatStore.getState().clearPendingChatFiles();
  }, [pendingChatFiles, addExternalFile]);

  // Reset chip tracking on chat switch
  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      chipifiedCardIdsRef.current.clear();
      chipifiedFileIdsRef.current.clear();
      // Prevent chip removal effect from interpreting stale chips as "removed"
      prevInlineChipsRef.current = [];
      setInlineChips([]);
      setMessage('');
      chatInputRef.current?.clear();
    }
  }, [chatId, setInlineChips, setMessage, chatInputRef]);

  // File attachment → inline chip conversion
  useEffect(() => {
    attachedFiles.forEach((file) => {
      const fileId = String(file.id);
      if (fileId.startsWith('pending-')) return;
      if (isImageMimeType(file.mimeType) || isImageFilename(file.name)) return;
      if (chipifiedFileIdsRef.current.has(fileId)) return;

      chipifiedFileIdsRef.current.add(fileId);
      chatInputRef.current?.insertChip({
        id: `file-${fileId}`,
        type: 'file',
        label: file.name,
        fileId: fileId,
      });
    });
  }, [attachedFiles, chatInputRef]);

  // Card → inline chip conversion
  useEffect(() => {
    cards.forEach((card) => {
      if (chipifiedCardIdsRef.current.has(card.id)) return;

      chipifiedCardIdsRef.current.add(card.id);
      chatInputRef.current?.insertChip({
        id: `card-${card.id}`,
        type: 'card',
        label: card.title || t('untitled'),
      });
    });
  }, [cards, t, chatInputRef]);

  // Chip removal detection and dispatch
  useEffect(() => {
    const prevFileChips = prevInlineChipsRef.current.filter(
      (c) => c.type === 'file'
    );
    const currFileChips = inlineChips.filter((c) => c.type === 'file');
    const prevCardChips = prevInlineChipsRef.current.filter(
      (c) => c.type === 'card'
    );
    const currCardChips = inlineChips.filter((c) => c.type === 'card');

    prevFileChips.forEach((prev) => {
      if (!currFileChips.some((curr) => curr.id === prev.id) && prev.fileId) {
        handleRemoveFileAttachment(prev.fileId);
        chipifiedFileIdsRef.current.delete(prev.fileId);
      }
    });

    prevCardChips.forEach((prev) => {
      if (!currCardChips.some((curr) => curr.id === prev.id)) {
        const cardId = parseInt(prev.id.replace('card-', ''), 10);
        if (!isNaN(cardId)) {
          onRemoveCard?.(cardId);
          chipifiedCardIdsRef.current.delete(cardId);
        }
      }
    });

    prevInlineChipsRef.current = inlineChips;
  }, [inlineChips, handleRemoveFileAttachment, onRemoveCard]);

  return { chipifiedFileIdsRef, chipifiedCardIdsRef };
}

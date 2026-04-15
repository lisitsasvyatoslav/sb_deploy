import { useCallback } from 'react';
import {
  AttachmentListItemData,
  AttachmentListMode,
  AttachmentType,
} from '@/features/chat/components/Attachments';
import { AttachmentInfo } from '@/features/chat/components/MessageActionBar';
import { ImagePreview } from '@/features/chat/components/MessageImagePreviews';
import { cardsApi, CardMinimalInfo } from '@/services/api/cards';
import { FileInfoResponse } from '@/services/api/files';
import { isImageMimeType } from '@/features/chat/hooks/useChatFileAttachments';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import type { Message } from '@/types';

interface UseMessageAttachmentBuildersParams {
  fileInfoCache: Record<string, FileInfoResponse>;
  openAttachmentsList:
    | ((
        attachments: AttachmentListItemData[],
        mode: AttachmentListMode,
        onDelete?: (id: string | number, type: AttachmentType) => void,
        messageId?: number
      ) => void)
    | null;
}

export function useMessageAttachmentBuilders({
  fileInfoCache,
  openAttachmentsList,
}: UseMessageAttachmentBuildersParams) {
  const { t } = useTranslation('chat');

  const buildAttachmentListData = useCallback(
    (msg: Message, cardsInfo: CardMinimalInfo[]): AttachmentListItemData[] => {
      const attachments: AttachmentListItemData[] = [];

      if (msg.cardIds && msg.cardIds.length > 0) {
        msg.cardIds.forEach((cardId, index) => {
          const cardInfo = cardsInfo.find((c) => c.id === cardId);
          attachments.push({
            id: cardId,
            type: 'note',
            name:
              cardInfo?.title ||
              t('messageAttachments.noteDefault', { index: index + 1 }),
            createdAt: msg.createdAt,
            attachedAt: msg.createdAt,
            noteContent: cardInfo?.content,
          });
        });
      }

      if (msg.fileIds && msg.fileIds.length > 0) {
        msg.fileIds.forEach((fileId, index) => {
          const fileInfo = fileInfoCache[fileId];
          const isImage = fileInfo ? isImageMimeType(fileInfo.mimeType) : false;
          attachments.push({
            id: fileId,
            type: isImage ? 'image' : 'document',
            name:
              fileInfo?.filename ||
              t('messageAttachments.fileDefault', { index: index + 1 }),
            createdAt: msg.createdAt,
            attachedAt: msg.createdAt,
            fileSize: fileInfo?.fileSize,
            imageUrl: isImage ? fileInfo?.downloadUrl : undefined,
          });
        });
      }

      if (msg.tickers && Object.keys(msg.tickers).length > 0) {
        Object.entries(msg.tickers).forEach(([ticker, securityId]) => {
          attachments.push({
            id: ticker,
            type: 'ticker',
            name: ticker,
            ticker: ticker,
            securityId: securityId ?? undefined,
            createdAt: msg.createdAt,
            attachedAt: msg.createdAt,
          });
        });
      }

      if (msg.linkUrls && msg.linkUrls.length > 0) {
        msg.linkUrls.forEach((url) => {
          let hostname = url;
          try {
            hostname = new URL(url).hostname;
          } catch {
            // Keep full URL if parsing fails
          }
          attachments.push({
            id: url,
            type: 'link',
            name: hostname,
            url: url,
            createdAt: msg.createdAt,
            attachedAt: msg.createdAt,
          });
        });
      }

      return attachments;
    },
    [fileInfoCache, t]
  );

  const handleOpenAttachmentsList = useCallback(
    async (msg: Message, mode: AttachmentListMode) => {
      if (!openAttachmentsList) return;

      const cardIds = msg.cardIds || [];
      let cardsInfo: CardMinimalInfo[] = [];

      if (cardIds.length > 0) {
        try {
          cardsInfo = await cardsApi.getCardsMinimal(cardIds);
        } catch (error) {
          logger.error('ChatMessageList', 'Failed to fetch card info', error);
        }
      }

      const attachments = buildAttachmentListData(msg, cardsInfo);
      openAttachmentsList(attachments, mode, undefined, msg.id);
    },
    [openAttachmentsList, buildAttachmentListData]
  );

  const getImagePreviews = useCallback(
    (msg: Message): ImagePreview[] => {
      if (!msg.fileIds || msg.fileIds.length === 0) return [];

      return msg.fileIds.reduce<ImagePreview[]>((acc, fileId) => {
        const fileInfo = fileInfoCache[fileId];
        if (fileInfo && isImageMimeType(fileInfo.mimeType)) {
          acc.push({
            id: fileId,
            url: fileInfo.downloadUrl,
            name: fileInfo.filename,
          });
        }
        return acc;
      }, []);
    },
    [fileInfoCache]
  );

  const buildAttachments = useCallback(
    (msg: Message, isEditing: boolean): AttachmentInfo[] => {
      const attachments: AttachmentInfo[] = [];
      const mode: AttachmentListMode = isEditing ? 'editing' : 'sent';
      const handleOpenList = () => handleOpenAttachmentsList(msg, mode);

      const notesCount = msg.cardIds?.length || 0;
      const tickersCount = msg.tickers ? Object.keys(msg.tickers).length : 0;
      const linksCount = msg.linkUrls?.length || 0;

      let imagesCount = 0;
      let filesCount = 0;
      if (msg.fileIds && msg.fileIds.length > 0) {
        msg.fileIds.forEach((fileId) => {
          const fileInfo = fileInfoCache[fileId];
          if (fileInfo && isImageMimeType(fileInfo.mimeType)) {
            imagesCount++;
          } else {
            filesCount++;
          }
        });
      }

      const typesPresent = [
        notesCount > 0,
        tickersCount > 0,
        imagesCount > 0,
        filesCount > 0,
        linksCount > 0,
      ].filter(Boolean).length;

      const totalAttachments =
        notesCount + tickersCount + imagesCount + filesCount + linksCount;

      if (totalAttachments === 0) return attachments;

      if (typesPresent === 1) {
        if (imagesCount > 0) {
          attachments.push({
            type: 'image',
            label: t('messageAttachments.images', { count: imagesCount }),
            onClick: handleOpenList,
          });
        } else if (notesCount > 0) {
          attachments.push({
            type: 'note',
            label: t('messageAttachments.notes', { count: notesCount }),
            onClick: handleOpenList,
          });
        } else if (filesCount > 0) {
          attachments.push({
            type: 'document',
            label: t('messageAttachments.files', { count: filesCount }),
            onClick: handleOpenList,
          });
        } else if (tickersCount > 0) {
          attachments.push({
            type: 'chart',
            label: t('messageAttachments.tickers', { count: tickersCount }),
            onClick: handleOpenList,
          });
        } else if (linksCount > 0) {
          attachments.push({
            type: 'link',
            label: t('messageAttachments.links', { count: linksCount }),
            onClick: handleOpenList,
          });
        }
      } else {
        attachments.push({
          type: 'attachment',
          label: t('messageAttachments.total', { count: totalAttachments }),
          onClick: handleOpenList,
        });
      }

      return attachments;
    },
    [handleOpenAttachmentsList, fileInfoCache, t]
  );

  const getSourcesCount = (msg: Message): number => {
    let count = 0;
    if (msg.cardIds) count += msg.cardIds.length;
    if (msg.fileIds) count += msg.fileIds.length;
    if (msg.tickers) count += Object.keys(msg.tickers).length;
    if (msg.linkUrls) count += msg.linkUrls.length;
    return count;
  };

  return {
    buildAttachments,
    getImagePreviews,
    handleOpenAttachmentsList,
    getSourcesCount,
  };
}

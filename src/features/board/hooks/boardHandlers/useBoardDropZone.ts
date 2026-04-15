import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { buildTagsFromNews } from '@/features/board/utils/newsTagMapper';
import { useBoardStore } from '@/stores/boardStore';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { CreateCardRequest } from '@/types';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { useCallback } from 'react';
import React from 'react';
import { useReactFlow } from '@xyflow/react';

interface UseBoardDropZoneConfig {
  boardId: number;
  actions: ReturnType<typeof useBoardActions>;
}

export const useBoardDropZone = ({
  boardId,
  actions,
}: UseBoardDropZoneConfig) => {
  const reactFlowInstance = useReactFlow();
  const { setIsDragOver } = useBoardStore();
  const { trackEvent } = useYandexMetrika();
  const { t } = useTranslation('board');

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(true);
    },
    [setIsDragOver]
  );

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
    },
    [setIsDragOver]
  );

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      const newsDataStr = event.dataTransfer.getData('application/news-data');

      if (newsDataStr) {
        try {
          const newsData = JSON.parse(newsDataStr);

          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          const tags = buildTagsFromNews(newsData);

          const cardData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'> = {
            boardId: boardId,
            title: newsData.title,
            content: newsData.content || '',
            type: 'news' as const,
            tags,
            meta: {
              source: 'news_feed',
              recommendation: newsData.recommendation,
              stocks: newsData.stocks,
              original_news_id: newsData.id,
              ai_data: newsData.metadata?.preprocessing?.results || null,
            },
          };

          await actions.createCard(cardData, position);

          trackEvent('news_drop_to_board', {
            board_id: boardId,
            news_id: newsData.id,
            ticker: newsData.stocks?.[0]?.symbol,
            x: Math.round(position.x),
            y: Math.round(position.y),
          });

          showSuccessToast(t('toast.newsAdded'));
        } catch (error) {
          logger.error('useBoardHandlers', 'News add error', error);
          showErrorToast(t('toast.newsAddError'));
        }
        return;
      }

      const files = Array.from(event.dataTransfer.files);
      const validFiles = files.filter(() => true); // Принимаем все файлы

      if (validFiles.length === 0) {
        showErrorToast(t('toast.noFilesToUpload'));
        return;
      }

      for (const file of validFiles) {
        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          // 3-step atomic flow (no race conditions):
          // 1. Create card with uploading flag
          // 2. Upload file to S3
          // 3. Update card with file metadata
          // 4. Invalidate queries to refresh UI
          // All notifications are handled inside uploadFile action
          await actions.uploadFile(file, position);
        } catch (error) {
          // Error notification is already handled in uploadFile action
          logger.error('useBoardHandlers', 'File upload error', {
            fileName: file.name,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },
    [setIsDragOver, reactFlowInstance, boardId, actions, trackEvent, t]
  );

  return {
    onDragOver,
    onDragLeave,
    onDrop,
  };
};

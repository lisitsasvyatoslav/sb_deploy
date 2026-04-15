/**
 * useBoardActions.ts - Unified CRUD operations for board cards
 *
 * Functions:
 * - useBoardActions({ boardId })                           Main hook: card CRUD operations
 * - deleteCard(cardId)                                     Deletes card and removes from UI
 * - createCard(cardData, position)                         Creates card at specified position
 * - updateCard(cardId, data)                               Updates existing card data
 * - uploadFile(file, position)                             4-step atomic file upload flow
 * - saveCardDimensions(cardId, size, currentMeta?)         Saves card resize dimensions
 * - saveCardColor(cardIds, color)                          Saves card header color
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteCardMutation,
  useUpdateCardMutation,
  usePositionedCreateCardMutation,
  boardQueryKeys,
} from '@/features/board/queries';
import { useBoardStore } from '@/stores/boardStore';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import { Card, CreateCardRequest } from '@/types';
import { filesApi } from '@/services/api/files';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

interface UseBoardActionsConfig {
  boardId: number;
}

/**
 * Unified CRUD operations for all card types
 * Pure data operations - no dialog or UI state management
 */
export const useBoardActions = ({ boardId }: UseBoardActionsConfig) => {
  const { setNodes, setEdges } = useBoardStore();
  const queryClient = useQueryClient();
  const { trackEvent } = useYandexMetrika();
  const { t } = useTranslation('board');

  // Mutations
  const createCardMutation = usePositionedCreateCardMutation();
  const updateCardMutation = useUpdateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();

  // Unified delete (works for all card types)
  // Note: Toast notification is handled by the caller to support batch operations
  const deleteCard = useCallback(
    async (cardId: number) => {
      try {
        await deleteCardMutation.mutateAsync({ cardId, boardId });
      } catch (error) {
        logger.error('useBoardActions', 'Card delete error', {
          cardId,
          error,
        });
        showErrorToast(t('toast.cardDeleteError'));
        return;
      }

      // Post-deletion cleanup (non-critical — card is already deleted on server)
      try {
        trackEvent('note_delete', {
          board_id: boardId,
          card_id: cardId,
        });
      } catch {
        // Analytics failure is never user-facing
      }

      try {
        const cardNodeId = `card-${cardId}`;
        setNodes((prev) => prev.filter((node) => node.id !== cardNodeId));
        setEdges((prev) =>
          prev.filter(
            (edge) => edge.source !== cardNodeId && edge.target !== cardNodeId
          )
        );
      } catch (error) {
        logger.error('useBoardActions', 'Post-delete cleanup failed', {
          cardId,
          error,
        });
      }
    },
    [boardId, deleteCardMutation, setNodes, setEdges, trackEvent, t]
  );

  // Unified create card (works for notes, files, etc.)
  const createCard = useCallback(
    async (
      cardData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'>,
      position: { x: number; y: number }
    ) => {
      try {
        const dataWithPosition = {
          ...cardData,
          x: Math.round(position.x),
          y: Math.round(position.y),
          zIndex: 0,
        };

        // Mutation will automatically use boardId from cardData for targeted invalidation
        const createdCard =
          await createCardMutation.mutateAsync(dataWithPosition);

        // Node will be added automatically via query invalidation
        showSuccessToast(t('toast.cardCreated'));

        return createdCard;
      } catch (error) {
        logger.error('useBoardActions', 'Card create error', error);
        showErrorToast(t('toast.cardCreateError'));
        throw error;
      }
    },
    [createCardMutation, t]
  );

  const updateCard = useCallback(
    async (cardId: number, data: Partial<Card>) => {
      try {
        await updateCardMutation.mutateAsync({ id: cardId, data, boardId });
        showSuccessToast(t('toast.cardUpdated'));
      } catch (error) {
        logger.error('useBoardActions', 'Card update error', error);
        showErrorToast(t('toast.cardUpdateError'));
        throw error;
      }
    },
    [boardId, updateCardMutation, t]
  );

  // File upload (4-step atomic flow: create card → upload to S3 → update card → invalidate)
  const uploadFile = useCallback(
    async (file: File, position: { x: number; y: number }) => {
      let cardId: number | undefined;

      try {
        // Step 1: Create card with uploading flag (skip auto-invalidation)
        const dataWithPosition = {
          boardId: boardId,
          title: file.name,
          content: '',
          type: 'file' as const,
          meta: { uploading: true },
          x: Math.round(position.x),
          y: Math.round(position.y),
          zIndex: 0,
          skipInvalidation: true, // Prevents auto-invalidation after create
        };

        const card = await createCardMutation.mutateAsync(dataWithPosition);
        cardId = card.id;

        logger.info('useBoardActions', 'Card created for file upload', {
          cardId: card.id,
          cardDataId: card.cardDataId,
          fileName: file.name,
        });

        // Step 2: Upload file to S3
        const fileInfo = await filesApi.uploadFile(file, card.cardDataId);

        logger.info('useBoardActions', 'File uploaded to S3', {
          fileId: fileInfo.fileId,
          fileName: fileInfo.filename,
        });

        // Step 3: Update card with file info (triggers targeted invalidation)
        await updateCardMutation.mutateAsync({
          id: card.id,
          data: {
            meta: {
              fileId: fileInfo.fileId,
              s3Key: fileInfo.s3Key,
              filename: fileInfo.filename,
              fileSize: fileInfo.fileSize,
              mimeType: fileInfo.mimeType,
              fileType: fileInfo.fileType,
            },
          },
          boardId,
        });

        await queryClient.refetchQueries({
          queryKey: boardQueryKeys.boardFull(boardId),
        });

        logger.info(
          'useBoardActions',
          'Card updated with file info, queries invalidated',
          { cardId: card.id }
        );

        showSuccessToast(t('toast.fileUploaded', { fileName: file.name }));

        return card;
      } catch (error) {
        logger.error('useBoardActions', 'File upload error', error);

        if (cardId) {
          try {
            await deleteCardMutation.mutateAsync({ cardId, boardId });
            logger.info(
              'useBoardActions',
              'Cleaned up card after failed upload',
              { cardId }
            );
          } catch (deleteError) {
            logger.error(
              'useBoardActions',
              'Card delete error after failed upload',
              deleteError
            );
          }
        }

        showErrorToast(t('toast.fileUploadError', { fileName: file.name }));

        throw error;
      }
    },
    [
      boardId,
      createCardMutation,
      updateCardMutation,
      deleteCardMutation,
      queryClient,
      t,
    ]
  );

  const saveCardDimensions = useCallback(
    async (
      cardId: number,
      size: { width: number; height: number },
      _currentMeta?: Record<string, unknown>
    ) => {
      const roundedSize = {
        width: Math.max(200, Math.round(size.width)),
        height: Math.max(180, Math.round(size.height)),
      };

      try {
        await updateCardMutation.mutateAsync({
          id: cardId,
          data: {
            width: roundedSize.width,
            height: roundedSize.height,
          },
          skipInvalidate: true,
        });

        setNodes((prev) =>
          prev.map((node) => {
            if (node.id === `card-${cardId}`) {
              return {
                ...node,
                style: {
                  ...(node.style || {}),
                  width: roundedSize.width,
                  height: roundedSize.height,
                },
                data: {
                  ...node.data,
                  width: roundedSize.width,
                  height: roundedSize.height,
                  dimensions: roundedSize,
                },
              };
            }
            return node;
          })
        );
      } catch (error) {
        logger.error('useBoardActions', 'Card dimensions save error', error);
        showErrorToast(t('toast.cardSizeSaveError'));
      }
    },
    [setNodes, updateCardMutation, t]
  );

  const saveCardColor = useCallback(
    async (cardIds: number[], color: string) => {
      try {
        await Promise.all(
          cardIds.map((cardId) =>
            updateCardMutation.mutateAsync({
              id: cardId,
              data: { color: color },
              skipInvalidate: true,
            })
          )
        );

        setNodes((prev) =>
          prev.map((node) => {
            const nodeCardId = node.id.startsWith('card-')
              ? parseInt(node.id.replace('card-', ''), 10)
              : null;

            if (nodeCardId && cardIds.includes(nodeCardId)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  color: color,
                },
              };
            }
            return node;
          })
        );
      } catch (error) {
        logger.error('useBoardActions', 'Card color save error', error);
        showErrorToast(t('toast.cardColorSaveError'));
      }
    },
    [setNodes, updateCardMutation, t]
  );

  return {
    // Unified CRUD operations
    createCard,
    deleteCard,
    updateCard,
    uploadFile,
    saveCardDimensions,
    saveCardColor,
  };
};

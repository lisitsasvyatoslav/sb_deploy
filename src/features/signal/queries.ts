/**
 * React Query hooks for Signal API
 */

import { boardQueryKeys } from '@/features/board/queries';
import { signalApi } from '@/services/api';
import type {
  CreateSignalWebhookRequest,
  UpdateSignalWebhookRequest,
} from '@/types';
import { logger } from '@/shared/utils/logger';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Mutation: Generate webhook URL (without saving)
 * Each call generates a new unique token
 */
export const useGenerateWebhookUrlMutation = () => {
  return useMutation({
    mutationFn: () => signalApi.generateWebhookUrl(),
  });
};

/**
 * Query: Get all signal webhooks for current user, optionally filtered by board_id
 */
export const useSignalWebhooksQuery = (boardId?: number) => {
  return useQuery({
    queryKey: ['signalWebhooks', boardId],
    queryFn: () => signalApi.getSignalWebhooks(boardId),
  });
};

/**
 * Query: Get single signal webhook by ID
 */
export const useSignalWebhookQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['signalWebhook', id],
    queryFn: () => signalApi.getSignalWebhook(id),
    enabled,
  });
};

/**
 * Query: Get signal history for webhook
 */
export const useSignalHistoryQuery = (
  webhookId: number,
  limit = 100,
  enabled = true
) => {
  return useQuery({
    queryKey: ['signalHistory', webhookId, limit],
    queryFn: () => signalApi.getSignalHistory(webhookId, limit),
    enabled,
  });
};

/**
 * Mutation: Create new signal webhook
 * After creating a new webhook, activates ALL webhooks for the same board
 */
export const useCreateSignalWebhookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSignalWebhookRequest) =>
      signalApi.createSignalWebhook(data),
    onSuccess: async (_data, variables) => {
      const boardId = variables.boardId;

      // Activate all webhooks for this board after creating new one
      if (boardId) {
        try {
          // Get all webhooks for this board
          const webhooksResponse = await signalApi.getSignalWebhooks(boardId);
          const allWebhooks = webhooksResponse.signals || [];

          // Activate all inactive webhooks
          await Promise.all(
            allWebhooks.map((webhook) => {
              if (!webhook.active) {
                return signalApi.updateSignalWebhook(webhook.id, {
                  active: true,
                });
              }
              return Promise.resolve();
            })
          );
        } catch (error) {
          logger.error(
            'useCreateSignalWebhookMutation',
            'Failed to activate webhooks after creation',
            error
          );
          // Don't throw - webhook was created successfully, activation is optional
        }
      }

      // Invalidate signal webhooks list to refetch with updated active states
      queryClient.invalidateQueries({ queryKey: ['signalWebhooks'] });

      // Invalidate board queries since signal webhook creation also creates a card on the board
      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: boardQueryKeys.boardFull(boardId),
        });
      }
    },
  });
};

/**
 * Mutation: Update signal webhook
 */
export const useUpdateSignalWebhookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSignalWebhookRequest;
      boardId?: number;
    }) => signalApi.updateSignalWebhook(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific signal webhook and webhooks list
      queryClient.invalidateQueries({
        queryKey: ['signalWebhook', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['signalWebhooks'] });

      // Invalidate board query to refresh card with updated title
      if (variables.boardId) {
        queryClient.invalidateQueries({
          queryKey: boardQueryKeys.boardFull(variables.boardId),
        });
      }
    },
  });
};

/**
 * Mutation: Delete signal webhook
 */
export const useDeleteSignalWebhookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => signalApi.deleteSignalWebhook(id),
    onSuccess: (_, id) => {
      // Invalidate signal webhooks list
      queryClient.invalidateQueries({ queryKey: ['signalWebhooks'] });
      // Remove specific signal webhook from cache
      queryClient.removeQueries({ queryKey: ['signalWebhook', id] });
    },
  });
};

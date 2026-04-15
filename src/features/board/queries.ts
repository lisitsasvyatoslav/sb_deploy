import { useCallback } from 'react';
import { boardApi } from '@/services/api/boards';
import { cardsApi } from '@/services/api/cards';
import { edgeApi } from '@/services/api/edges';
import {
  findNonOverlappingPosition,
  removePendingPosition,
  posKey,
} from '@/features/board/utils/cardPositioning';
import { useBoardStore } from '@/stores/boardStore';
import type { Card, CreateBoardRequest, CreateCardRequest } from '@/types';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * Query Keys - Centralized cache management for board feature
 */
export const boardQueryKeys = {
  all: ['boards'] as const,
  boards: (section?: string): string[] =>
    section ? ['boards', 'list', section] : ['boards', 'list'],
  homeBoard: () => [...boardQueryKeys.all, 'home'] as const,
  board: (id: number) => [...boardQueryKeys.all, id] as const,
  boardFull: (id: number) => [...boardQueryKeys.all, id, 'full'] as const,
  edges: () => ['edges'] as const,
};

export const useBoardsAllQuery = (options?: {
  enabled?: boolean;
  section?: 'portfolio' | 'strategy';
}) => {
  return useQuery({
    queryKey: boardQueryKeys.boards(options?.section),
    queryFn: () => boardApi.getBoards(options?.section),
    staleTime: 1000 * 30, // 30 seconds
    enabled: options?.enabled,
  });
};

export const useHomeBoardQuery = () => {
  return useQuery({
    queryKey: boardQueryKeys.homeBoard(),
    queryFn: () => boardApi.getHomeBoard(),
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: keepPreviousData,
  });
};

export const useBoardQuery = (id: number) => {
  return useQuery({
    queryKey: boardQueryKeys.board(id),
    queryFn: () => boardApi.getBoard(id),
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: keepPreviousData,
  });
};

export const useBoardFullQuery = (id: number) => {
  return useQuery({
    queryKey: boardQueryKeys.boardFull(id),
    queryFn: () => boardApi.getBoardFull(id),
    staleTime: 1000 * 30, // 30 seconds
    // Removed placeholderData to allow proper UI updates after card mutations
  });
};

/**
 * Query: Load Edges
 */
export const useEdgesQuery = () => {
  return useQuery({
    queryKey: boardQueryKeys.edges(),
    queryFn: () => edgeApi.getAllEdges(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Mutation: Delete Card
 * Backend performs cascading deletion of all dependencies (edges, positions, AI connections)
 * Accepts optional boardId for targeted invalidation
 */
export const useDeleteCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cardId,
      boardId,
    }: {
      cardId: number;
      boardId?: number;
    }) => {
      await cardsApi.deleteCard(cardId);
      return { cardId, boardId };
    },
    onSuccess: (data) => {
      if (data.boardId) {
        queryClient.invalidateQueries({
          queryKey: boardQueryKeys.boardFull(data.boardId),
        });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.edges() });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
        queryClient.invalidateQueries({
          queryKey: ['signalWebhooks', data.boardId],
        });
      } else {
        // Fallback: invalidate all (for backward compatibility)
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.edges() });
        // Invalidate all signal webhooks queries
        queryClient.invalidateQueries({ queryKey: ['signalWebhooks'] });
      }
    },
  });
};

/**
 * Mutation: Update Card
 * Accepts optional boardId for targeted invalidation (avoids invalidating all boards)
 */
export const useUpdateCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Card>;
      boardId?: number;
      skipInvalidate?: boolean;
    }) => cardsApi.updateCard(id, data),
    onSuccess: (_data, variables) => {
      if (variables.skipInvalidate) {
        return;
      }
      if (variables.boardId) {
        queryClient.invalidateQueries({
          queryKey: boardQueryKeys.boardFull(variables.boardId),
        });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
      } else {
        // Fallback: invalidate all (for backward compatibility)
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.all });
      }
    },
  });
};

/**
 * Mutation: Create Card
 * Supports optional position parameter in data:
 * - position: { x, y, z_index } - card position on canvas
 * - skipInvalidation: true - prevents automatic query invalidation (for batched operations)
 *
 * Backend should automatically:
 * - Create position (if position is provided)
 * - Create edges to context cards (if context_cards are in meta)
 */
export const useCreateCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateCardRequest & {
        position?: { x: number; y: number; z_index: number };
        skipInvalidation?: boolean;
      }
    ) => {
      const cardData = { ...data };
      delete cardData.skipInvalidation;
      return cardsApi.createCard(cardData);
    },
    onSuccess: (_data, variables) => {
      if (variables.skipInvalidation) {
        return;
      }

      if (variables.boardId) {
        queryClient.invalidateQueries({
          queryKey: boardQueryKeys.boardFull(variables.boardId),
        });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.edges() });
        // Invalidate boards list to update sorting (board's updatedAt changed on backend)
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
      } else {
        // Fallback: invalidate all (for backward compatibility)
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: boardQueryKeys.edges() });
      }
    },
  });
};

type CreateCardData = CreateCardRequest & {
  position?: { x: number; y: number; z_index: number };
  skipInvalidation?: boolean;
};

/**
 * Positioned wrapper around useCreateCardMutation.
 * Automatically runs card x/y through findNonOverlappingPosition
 * so every card creation path gets overlap detection.
 */
export const usePositionedCreateCardMutation = () => {
  const mutation = useCreateCardMutation();

  const adjustAndCreate = useCallback(
    async (data: CreateCardData) => {
      // If x/y are not provided, pass through without overlap adjustment
      if (data.x == null || data.y == null) {
        return mutation.mutateAsync(data);
      }

      const { allCards } = useBoardStore.getState();
      const adjusted = findNonOverlappingPosition(
        { x: data.x, y: data.y },
        allCards
      );
      const x = Math.round(adjusted.x);
      const y = Math.round(adjusted.y);

      try {
        return await mutation.mutateAsync({ ...data, x, y });
      } catch (e) {
        removePendingPosition(posKey(x, y));
        throw e;
      }
    },
    [mutation]
  );

  return {
    ...mutation,
    mutate: adjustAndCreate,
    mutateAsync: adjustAndCreate,
  };
};

/**
 * Mutation: Create Board
 */
export const useCreateBoardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.edges() });
    },
  });
};

/**
 * Mutation: Delete Board
 */
export const useDeleteBoardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: number) => boardApi.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.homeBoard() });
    },
  });
};

/**
 * Mutation: Duplicate Board
 */
export const useDuplicateBoardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: number) => boardApi.duplicateBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.boards() });
    },
  });
};

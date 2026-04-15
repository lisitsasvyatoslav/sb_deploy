import { useCallback } from 'react';
import {
  useUpdateCardMutation,
  useDeleteCardMutation,
} from '@/features/board/queries';
import { useBoardStore } from '@/stores/boardStore';
import type { CardMeta } from '@/types';

export interface UseCardOperationsReturn {
  updateTitle: (title: string) => Promise<void>;
  updateColor: (color: string) => Promise<void>;
  updateMeta: (partialMeta: Partial<CardMeta>) => Promise<void>;
  deleteCard: () => Promise<void>;
}

/**
 * Unified CRUD hook for card operations.
 *
 * Performs optimistic updates to boardStore (setAllCards + setNodes)
 * then persists via useUpdateCardMutation.
 *
 * When cardId or boardId is null (preview/create mode), all operations are no-op.
 */
export function useCardOperations(
  cardId: number | null,
  boardId: number | null
): UseCardOperationsReturn {
  const updateCardMutation = useUpdateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();

  const nodeId = cardId ? `card-${cardId}` : null;

  const updateTitle = useCallback(
    async (title: string) => {
      if (!cardId || !boardId || !nodeId) return;
      const { setAllCards, allCards, setNodes } = useBoardStore.getState();
      setAllCards(allCards.map((c) => (c.id === cardId ? { ...c, title } : c)));
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, title } } : n
        )
      );
      await updateCardMutation.mutateAsync({
        id: cardId,
        data: { title },
        boardId,
      });
    },
    [cardId, boardId, nodeId, updateCardMutation]
  );

  const updateColor = useCallback(
    async (color: string) => {
      if (!cardId || !boardId || !nodeId) return;
      const { setAllCards, allCards, setNodes } = useBoardStore.getState();
      setAllCards(allCards.map((c) => (c.id === cardId ? { ...c, color } : c)));
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, color } } : n
        )
      );
      await updateCardMutation.mutateAsync({
        id: cardId,
        data: { color },
        boardId,
      });
    },
    [cardId, boardId, nodeId, updateCardMutation]
  );

  const updateMeta = useCallback(
    async (partialMeta: Partial<CardMeta>) => {
      if (!cardId || !boardId || !nodeId) return;
      const { setAllCards, allCards, setNodes } = useBoardStore.getState();
      const currentCard = allCards.find((c) => c.id === cardId);
      if (!currentCard) return;
      const mergedMeta = { ...currentCard.meta, ...partialMeta };
      setAllCards(
        allCards.map((c) => (c.id === cardId ? { ...c, meta: mergedMeta } : c))
      );
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, meta: mergedMeta } } : n
        )
      );
      await updateCardMutation.mutateAsync({
        id: cardId,
        data: { meta: mergedMeta },
        boardId,
      });
    },
    [cardId, boardId, nodeId, updateCardMutation]
  );

  const deleteCard = useCallback(async () => {
    if (!cardId || !boardId) return;
    await deleteCardMutation.mutateAsync({ cardId, boardId });
  }, [cardId, boardId, deleteCardMutation]);

  return { updateTitle, updateColor, updateMeta, deleteCard };
}

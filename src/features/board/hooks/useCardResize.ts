import { useCallback } from 'react';
import { useBoardActions } from './useBoardActions';
import { useBoardStore } from '@/stores/boardStore';

/**
 * Hook for resizing a card from within card content components.
 * Replaces the implicit window.dispatchEvent('widgetResize') pattern
 * with a direct store-based call.
 */
export function useCardResize(cardId: number | undefined) {
  const boardId = useBoardStore((s) => s.boardId);
  const { saveCardDimensions } = useBoardActions({ boardId: boardId ?? 0 });

  return useCallback(
    (size: { width: number; height: number }) => {
      if (!cardId || !boardId) return;
      saveCardDimensions(cardId, size);
    },
    [cardId, boardId, saveCardDimensions]
  );
}

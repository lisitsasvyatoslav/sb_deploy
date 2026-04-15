import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';
import { useDeleteCardMutation } from '@/features/board/queries';
import { DEFAULT_BADGE_COLORS } from '@/features/board/hooks/useCardHeader';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useChatStore } from '@/stores/chatStore';
import { Card, CardType } from '@/types';
import { MutableRefObject, useCallback, useMemo, useState } from 'react';
import React from 'react';
import { Node } from '@xyflow/react';

type MutateCardFn = (vars: {
  id: number;
  data: Partial<Card>;
  boardId?: number;
  skipInvalidate?: boolean;
}) => void;

interface UseCardNodeActionsParams {
  data: {
    id: number;
    boardId: number;
    type: CardType;
    color?: string;
  };
  id: string;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  mutateCardRef: MutableRefObject<MutateCardFn>;
}

export function useCardNodeActions({
  data,
  id,
  setNodes,
  mutateCardRef,
}: UseCardNodeActionsParams) {
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  // Ask AI handler
  const { createChatWithCards, addCardsToActiveChat } = useChatManager();
  const { activeChatId, openSidebar: openChatSidebar } = useChatStore();
  const handleAskAI = useCallback(async () => {
    if (activeChatId) {
      addCardsToActiveChat([data.id], data.boardId);
    } else {
      await createChatWithCards([data.id], undefined, undefined, data.boardId);
      openChatSidebar();
    }
  }, [
    activeChatId,
    addCardsToActiveChat,
    createChatWithCards,
    openChatSidebar,
    data.id,
    data.boardId,
  ]);

  // Delete handler
  const deleteCardMutation = useDeleteCardMutation();
  const handleDelete = useCallback(() => {
    deleteCardMutation.mutate({ cardId: data.id, boardId: data.boardId });
  }, [deleteCardMutation, data.id, data.boardId]);

  // Color change handler
  const handleColorChange = useCallback(
    (color: string) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, color } } : node
        )
      );
      mutateCardRef.current({
        id: data.id,
        data: { color },
        boardId: data.boardId,
      });
    },
    [data.id, data.boardId, setNodes, id]
  );

  // Unset card.color falls back to the per-type default so the trigger circle
  // matches the rendered title badge. Empty string (explicit "no color") is
  // preserved since it's not nullish.
  const colorWidgetCurrentColor = data.color ?? DEFAULT_BADGE_COLORS[data.type];
  const colorWidget = useMemo(
    () =>
      React.createElement(SelectColorWidget, {
        currentColor: colorWidgetCurrentColor,
        onColorChange: handleColorChange,
      }),
    [colorWidgetCurrentColor, handleColorChange]
  );

  return {
    contextMenuPos,
    setContextMenuPos,
    handleMoreClick,
    handleAskAI,
    handleDelete,
    handleColorChange,
    colorWidget,
  };
}

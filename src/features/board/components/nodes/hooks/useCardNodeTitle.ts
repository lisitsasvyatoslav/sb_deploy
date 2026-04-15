import { Card } from '@/types';
import { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { useBoardUIStore } from '@/stores/boardUIStore';

type MutateCardFn = (vars: {
  id: number;
  data: Partial<Card>;
  boardId?: number;
  skipInvalidate?: boolean;
}) => void;

interface UseCardNodeTitleParams {
  data: {
    id: number;
    boardId: number;
    title?: string;
  };
  id: string;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  mutateCardRef: MutableRefObject<MutateCardFn>;
}

export function useCardNodeTitle({
  data,
  id,
  setNodes,
  mutateCardRef,
}: UseCardNodeTitleParams) {
  const [editTitle, setEditTitle] = useState(data.title || '');
  const [titleFocusTrigger, setTitleFocusTrigger] = useState(0);

  // Sync local title when card data changes externally
  useEffect(() => {
    setEditTitle(data.title || '');
  }, [data.title]);

  // Consume titleEditCardId signal from store to focus the inline title input
  const titleEditCardId = useBoardUIStore((s) => s.titleEditCardId);
  useEffect(() => {
    if (titleEditCardId === data.id) {
      setTitleFocusTrigger((n) => n + 1);
      useBoardUIStore.getState().setTitleEditCardId(null);
    }
  }, [titleEditCardId, data.id]);

  const handleTitleConfirm = useCallback(() => {
    if (editTitle !== data.title) {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, title: editTitle } }
            : node
        )
      );
      mutateCardRef.current({
        id: data.id,
        data: { title: editTitle },
        boardId: data.boardId,
      });
    }
  }, [editTitle, data.id, data.title, data.boardId, setNodes, id]);

  return {
    editTitle,
    setEditTitle,
    titleFocusTrigger,
    setTitleFocusTrigger,
    handleTitleConfirm,
  };
}

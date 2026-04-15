import { Card } from '@/types';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Node } from '@xyflow/react';

const DEFAULT_CARD_WIDTH = 336;
const DEFAULT_CARD_HEIGHT = 280;

type MutateCardFn = (vars: {
  id: number;
  data: Partial<Card>;
  boardId?: number;
  skipInvalidate?: boolean;
}) => void;

interface UseCardNodeResizeParams {
  data: {
    id: number;
    boardId: number;
    dimensions?: { width: number; height: number };
  };
  id: string;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  mutateCardRef: MutableRefObject<MutateCardFn>;
}

export function useCardNodeResize({
  data,
  id,
  setNodes,
  mutateCardRef,
}: UseCardNodeResizeParams) {
  const [size, setSize] = useState({
    width: data.dimensions?.width || DEFAULT_CARD_WIDTH,
    height: data.dimensions?.height || DEFAULT_CARD_HEIGHT,
  });
  const isResizingRef = useRef(false);

  useEffect(
    () => () => {
      isResizingRef.current = false;
    },
    []
  );

  // Sync size when external data changes
  useEffect(() => {
    setSize({
      width: data.dimensions?.width || DEFAULT_CARD_WIDTH,
      height: data.dimensions?.height || DEFAULT_CARD_HEIGHT,
    });
  }, [data.dimensions?.height, data.dimensions?.width]);

  const persistSize = useCallback(
    (nextSize: { width: number; height: number }) => {
      const roundedSize = {
        width: Math.max(280, Math.round(nextSize.width)),
        height: Math.max(220, Math.round(nextSize.height)),
      };

      setNodes((prev) =>
        prev.map((node) =>
          node.id === id
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: roundedSize.width,
                  height: roundedSize.height,
                },
                data: {
                  ...node.data,
                  dimensions: roundedSize,
                },
              }
            : node
        )
      );

      mutateCardRef.current({
        id: data.id,
        data: { width: roundedSize.width, height: roundedSize.height },
        boardId: data.boardId,
        skipInvalidate: true,
      });
    },
    [data.id, data.boardId, id, setNodes]
  );

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      const mouseButton =
        'nativeEvent' in event && event.nativeEvent instanceof MouseEvent
          ? event.nativeEvent.button
          : 'touch';

      if (mouseButton !== 'touch' && mouseButton !== 0) {
        event.preventDefault();
        isResizingRef.current = false;
        return;
      }

      isResizingRef.current = true;
    },
    []
  );

  const handleResize = useCallback(
    (
      _event: MouseEvent | TouchEvent,
      _direction: unknown,
      ref: HTMLElement
    ) => {
      if (!isResizingRef.current) {
        return;
      }

      setSize({
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      });
    },
    []
  );

  const handleResizeStop = useCallback(
    (
      _event: MouseEvent | TouchEvent,
      _direction: unknown,
      ref: HTMLElement
    ) => {
      if (!isResizingRef.current) {
        return;
      }

      isResizingRef.current = false;
      const nextSize = {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      };
      setSize(nextSize);
      persistSize(nextSize);
    },
    [persistSize]
  );

  return {
    size,
    isResizingRef,
    handleResizeStart,
    handleResize,
    handleResizeStop,
  };
}

import { useCallback, useEffect, useState } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize?: (width: number) => void;
}

interface UseResizableReturn {
  width: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Hook for implementing drag-to-resize functionality
 * @param options - Configuration options for resizable behavior
 * @returns width, isResizing state, and handleMouseDown handler
 */
export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  onResize,
}: UseResizableOptions): UseResizableReturn => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setStartX(e.clientX);
      setStartWidth(width);
    },
    [width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate the difference from start position
      // For right-side resizing: moving right = wider, moving left = narrower
      const delta = e.clientX - startX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + delta)
      );

      setWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, minWidth, maxWidth, onResize]);

  return {
    width,
    isResizing,
    handleMouseDown,
  };
};

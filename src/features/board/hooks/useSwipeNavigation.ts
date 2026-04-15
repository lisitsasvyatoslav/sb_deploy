import { useCallback, useState } from 'react';

interface UseSwipeNavigationProps {
  itemsCount: number;
  minSwipeDistance?: number;
  transitionDuration?: number;
}

interface UseSwipeNavigationReturn {
  currentIndex: number;
  isTransitioning: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  goToIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

/**
 * Hook for swipe navigation with animation support
 * Handles both touch and mouse events for carousel-like navigation
 */
export const useSwipeNavigation = ({
  itemsCount,
  minSwipeDistance = 50,
  transitionDuration = 300,
}: UseSwipeNavigationProps): UseSwipeNavigationReturn => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Helper to trigger transition animation
  const triggerTransition = useCallback(
    (callback: () => void) => {
      setIsTransitioning(true);
      callback();
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    },
    [transitionDuration]
  );

  // Navigation functions
  const goToIndex = useCallback(
    (index: number) => {
      if (index !== currentIndex && index >= 0 && index < itemsCount) {
        triggerTransition(() => setCurrentIndex(index));
      }
    },
    [currentIndex, itemsCount, triggerTransition]
  );

  const goNext = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => (prev + 1) % itemsCount);
    });
  }, [itemsCount, triggerTransition]);

  const goPrev = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
    });
  }, [itemsCount, triggerTransition]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe || isRightSwipe) {
        e.stopPropagation();

        if (isLeftSwipe) {
          goNext();
        } else if (isRightSwipe) {
          goPrev();
        }
      }

      setTouchStart(null);
      setTouchEnd(null);
    },
    [touchStart, touchEnd, minSwipeDistance, goNext, goPrev]
  );

  // Mouse handlers for desktop
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMouseDragging(true);
    setMouseStart(e.clientX);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isMouseDragging || !mouseStart) return;

      const distance = mouseStart - e.clientX;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe || isRightSwipe) {
        e.stopPropagation();

        if (isLeftSwipe) {
          goNext();
        } else if (isRightSwipe) {
          goPrev();
        }

        setIsMouseDragging(false);
        setMouseStart(null);
      }
    },
    [isMouseDragging, mouseStart, minSwipeDistance, goNext, goPrev]
  );

  const onMouseUp = useCallback(() => {
    setIsMouseDragging(false);
    setMouseStart(null);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseDragging(false);
    setMouseStart(null);
  }, []);

  return {
    currentIndex,
    isTransitioning,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    goToIndex,
    goNext,
    goPrev,
  };
};

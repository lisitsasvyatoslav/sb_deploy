import {
  LAYOUT_CONSTANTS,
  getMaxContainerWidth,
} from '@/shared/constants/layout';
import { useViewStore } from '@/stores/appViewStore';
import { useEffect, useState } from 'react';

/**
 * Hook to calculate the number of columns that fit in the container
 * Uses measured and corrected container width from AppLayout
 */
export const useColsCount = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const containerWidth = useViewStore((state) => state.containerWidth);

  // Track screen width for responsive card sizing
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate number of columns (same logic as GridView)
  const cols = (() => {
    const isLargeScreen = screenWidth >= LAYOUT_CONSTANTS.BREAKPOINT_LARGE;
    const cardWidth = isLargeScreen
      ? LAYOUT_CONSTANTS.CARD_WIDTH_LARGE
      : LAYOUT_CONSTANTS.CARD_WIDTH_SMALL;
    const gap = LAYOUT_CONSTANTS.GAP;
    const maxCols = LAYOUT_CONSTANTS.MAX_COLS;
    const maxWidthValue = getMaxContainerWidth(screenWidth);

    // Use measured and corrected container width from AppLayout
    const measuredWidth = containerWidth ?? 1200;

    let availableWidth: number;

    if (isLargeScreen) {
      // Wide screens with max-width constraint
      availableWidth = maxWidthValue;
    } else {
      // Normal screens: use measured container width or max width, whichever is smaller
      availableWidth = Math.min(measuredWidth, maxWidthValue);
    }

    // Calculate columns: (width + gap) / (cardWidth + gap)
    const calculated = Math.max(
      1,
      Math.floor((availableWidth + gap) / (cardWidth + gap))
    );

    // Apply max columns limit
    return Math.min(maxCols, calculated);
  })();

  return cols;
};

import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import { useEffect, useState } from 'react';

/**
 * Hook to get responsive card dimensions based on screen width
 * Returns large dimensions for wide screens (>= 2560px), small otherwise
 */
export const useResponsiveCardSize = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = screenWidth >= LAYOUT_CONSTANTS.BREAKPOINT_LARGE;

  return {
    cardWidth: isLargeScreen
      ? LAYOUT_CONSTANTS.CARD_WIDTH_LARGE
      : LAYOUT_CONSTANTS.CARD_WIDTH_SMALL,
    cardHeight: isLargeScreen
      ? LAYOUT_CONSTANTS.CARD_HEIGHT_LARGE
      : LAYOUT_CONSTANTS.CARD_HEIGHT_SMALL,
    screenWidth,
  };
};

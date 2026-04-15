import { getFlowInitialOffsetX } from '@/shared/constants/layout';
import { useViewStore } from '@/stores/appViewStore';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import { useColsCount } from './useColsCount';
import { useResponsiveCardSize } from './useResponsiveCardSize';

/**
 * Centralized hook for Flow view layout parameters
 * Combines all layout calculations needed for FlowBoardsView
 */
export const useFlowLayoutParams = () => {
  const containerWidth = useViewStore((state) => state.containerWidth);
  const { isOpen: isNewsOpen } = useNewsSidebarStore();

  const cols = useColsCount();
  const { cardWidth, cardHeight, screenWidth } = useResponsiveCardSize();

  const initialOffsetX = getFlowInitialOffsetX(
    isNewsOpen,
    screenWidth,
    containerWidth
  );

  return {
    cols,
    cardWidth,
    cardHeight,
    initialOffsetX,
  };
};

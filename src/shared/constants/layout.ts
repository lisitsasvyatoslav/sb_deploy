/**
 * Layout constants for the application
 * Centralized design system values for consistency
 */

export const LAYOUT_CONSTANTS = {
  // Main navigation sidebar
  SIDEBAR_COLLAPSED_WIDTH: 48, // Collapsed mode - only icons
  SIDEBAR_EXPANDED_WIDTH: 200, // Expanded mode - icons + text + submenu
  MAIN_SIDEBAR_WIDTH: 200, // @deprecated - use SIDEBAR_EXPANDED_WIDTH

  // Expandable panel dimensions (Explore, Chat)
  SIDEBAR_CONTENT_WIDTH: 365, // Internal content width
  SIDEBAR_MARGIN: 8, // External margin

  // Card dimensions
  CARD_WIDTH_SMALL: 184,
  CARD_HEIGHT_SMALL: 168,

  CARD_WIDTH_LARGE: 212,
  CARD_HEIGHT_LARGE: 168, // Same as SMALL — unified per current design

  // Spacing
  GAP: 8,

  // Grid padding
  PADDING: {
    TOP: 84,
    TITLE_HEIGHT: 28,
    TITLE_BOTTOM: 16,
    LEFT: 16,
  },

  // Grid constraints
  MAX_COLS: 8,
  MAX_CONTAINER_WIDTH_LARGE: 1936, // For screens 2560px+
  MAX_CONTAINER_WIDTH_NORMAL: 1600, // For screens < 2560px

  // Responsive breakpoint
  BREAKPOINT_LARGE: 2560,
} as const;

/**
 * Calculate total sidebar width (content + margin)
 * @param width - Optional custom width (defaults to SIDEBAR_CONTENT_WIDTH)
 */
export const getSidebarTotalWidth = (
  width: number = LAYOUT_CONSTANTS.SIDEBAR_CONTENT_WIDTH
) => {
  return width + LAYOUT_CONSTANTS.SIDEBAR_MARGIN;
};

/**
 * Get responsive maximum container width based on screen size
 */
export const getMaxContainerWidth = (screenWidth: number): number => {
  return screenWidth >= LAYOUT_CONSTANTS.BREAKPOINT_LARGE
    ? LAYOUT_CONSTANTS.MAX_CONTAINER_WIDTH_LARGE
    : LAYOUT_CONSTANTS.MAX_CONTAINER_WIDTH_NORMAL;
};

/**
 * Get responsive maximum container width as Tailwind class
 */
export const getMaxContainerWidthClass = (screenWidth: number): string => {
  const maxWidth = getMaxContainerWidth(screenWidth);
  return `max-w-[${maxWidth}px]`;
};

/**
 * Calculate initial horizontal offset for Flow view to align with Grid
 * Takes into account sidebar and centering on wide screens
 */
export const getFlowInitialOffsetX = (
  isNewsOpen: boolean,
  screenWidth: number,
  containerWidth?: number
) => {
  let offset = 0;

  // Add sidebar width if open
  if (isNewsOpen) {
    offset += getSidebarTotalWidth();
  }

  // On wide screens, Grid content is centered with responsive max-width
  // Need to add centering offset for Flow to match
  if (containerWidth) {
    const maxWidth = getMaxContainerWidth(screenWidth);
    if (containerWidth > maxWidth) {
      const centeringOffset = (containerWidth - maxWidth) / 2;
      offset += centeringOffset;
    }
  }

  return offset;
};

/**
 * Calculate total top padding for pages with title
 * Includes: default padding + title height + title bottom spacing
 */
export const getPageTopPadding = () => {
  const { PADDING } = LAYOUT_CONSTANTS;
  return PADDING.TOP + PADDING.TITLE_HEIGHT + PADDING.TITLE_BOTTOM;
};

/**
 * @deprecated Use getPageTopPadding() instead
 */
export const getOverviewTopPadding = getPageTopPadding;

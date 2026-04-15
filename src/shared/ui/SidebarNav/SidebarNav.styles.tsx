/**
 * Shared state classes for all SidebarNav item variants.
 * Maps to Figma states: Default, Hover, Pressed, Active, Focused.
 */
export const getStateClasses = (
  isActive: boolean,
  isHighlighted?: boolean
): string => {
  if (isHighlighted) return 'bg-accent-active text-mind-accent';
  if (isActive)
    return 'text-mind-accent hover:bg-blackinverse-a4 active:bg-blackinverse-a6';
  return 'text-blackinverse-a56 hover:bg-blackinverse-a4 hover:text-blackinverse-a72 active:bg-blackinverse-a6 active:text-blackinverse-a72';
};

/** Base interactive classes shared across all sidebar nav items. */
export const BASE_INTERACTIVE =
  'transition-colors duration-150 outline-none focus-visible:bg-accent-active focus-visible:text-mind-accent';

/** Standard 20×20 icon wrapper classes. */
export const ICON_WRAPPER_CLASS =
  'flex-shrink-0 w-spacing-20 h-spacing-20 flex items-center justify-center';

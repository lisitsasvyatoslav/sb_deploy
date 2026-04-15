// Main exports - Dropdown with items (recommended for most cases)
export { Dropdown, DROPDOWN_CONTAINER_CLASSES } from './Dropdown';
export type { DropdownProps } from './Dropdown';

// Header component (theme switcher)
export { DropdownHeader } from './DropdownHeader';
export type {
  DropdownHeaderProps,
  DropdownHeaderThemeValue,
} from './DropdownHeader';

// Item button component (for use with DropdownBase/DropdownCompound or standalone)
export {
  DropdownItemButton,
  DropdownItemText,
  DropdownItemIconSlot,
  getItemTextClasses,
  DROPDOWN_ITEM_CLASSES,
} from './DropdownItemButton';
export type {
  DropdownItem,
  DropdownItemIcon,
  DropdownItemVariant,
} from './DropdownItemButton';

// Multi-select dropdown with checkboxes
export { DropdownMultiSelect } from './DropdownMultiSelect';
export type {
  DropdownMultiSelectProps,
  DropdownMultiSelectItem,
} from './DropdownMultiSelect';

// Base Render Props API (for custom menu content)
export { DropdownBase } from './DropdownBase';
export type {
  DropdownBaseProps,
  DropdownBaseTriggerProps,
} from './DropdownBase';

// Compound Components API (for advanced/custom use cases)
export { DropdownCompound } from './DropdownCompound';

// Sub-components (can be used independently if needed)
export { DropdownTrigger } from './DropdownTrigger';
export { DropdownMenu } from './DropdownMenu';
export { useDropdownContext } from './DropdownContext';

// Types
export type {
  DropdownCompoundRootProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownPlacement,
  ComputedPosition,
  DropdownContextValue,
} from './Dropdown.types';

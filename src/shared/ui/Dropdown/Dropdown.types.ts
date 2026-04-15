import { CSSProperties, ReactNode, RefObject } from 'react';

/**
 * Allowed menu placement directions.
 * Cardinal: 'top' | 'bottom' | 'left' | 'right'
 * Compound: primary axis + cross-axis alignment, e.g. 'bottom-right' = menu below, right-aligned
 */
export type DropdownPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

/**
 * Computed menu position after viewport correction
 */
export interface ComputedPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  placement: DropdownPlacement; // Actual direction after auto-adjust
}

/**
 * Props for DropdownCompound root component (Compound Components)
 */
export interface DropdownCompoundRootProps {
  children: ReactNode;

  /**
   * Controlled state - whether the dropdown is open
   */
  open?: boolean;

  /**
   * Callback on state change (controlled mode)
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Uncontrolled initial state
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Whether to close on outside click
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * Whether to close on Escape key press
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to close on scroll
   * @default true
   */
  closeOnScroll?: boolean;
}

/**
 * Props for Dropdown.Trigger
 */
export interface DropdownTriggerProps {
  children: ReactNode | ((isOpen: boolean) => ReactNode);
  className?: string;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for Dropdown.Menu
 */
export interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
  /** Additional inline styles applied to the menu container */
  style?: CSSProperties;

  /**
   * Preferred placement direction
   * @default 'bottom'
   */
  placement?: DropdownPlacement;

  /**
   * Offset from trigger element (in pixels)
   * @default 8
   */
  offset?: number;

  /**
   * z-index for Portal menu
   * @default 10100
   */
  zIndex?: number;

  /**
   * Whether to use Portal for rendering
   * @default true
   */
  usePortal?: boolean;

  /**
   * Stretch menu to match trigger element width
   * @default false
   */
  matchTriggerWidth?: boolean;
}

/**
 * Context value for Dropdown
 */
export interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
  closeOnClickOutside: boolean;
  closeOnEscape: boolean;
  closeOnScroll: boolean;
}

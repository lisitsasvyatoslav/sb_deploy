'use client';

import { DropdownCompound } from './DropdownCompound';
import { useDropdownContext } from './DropdownContext';
import type { DropdownPlacement } from './Dropdown.types';
import { useCallback, type ReactNode } from 'react';

/**
 * Trigger render props - provides full control over the trigger element
 */
export interface DropdownBaseTriggerProps {
  /** Current open state */
  isOpen: boolean;
  /** Callback to toggle state - should be called on click */
  onClick: () => void;
  /** Ref for the trigger element — attach to the outermost trigger DOM node.
   *  Typed as `any` due to React 18 ref invariance: RefObject<HTMLElement>
   *  is not assignable to LegacyRef<HTMLDivElement|HTMLButtonElement>.
   *  Will be fixed when upgrading to React 19 where refs are covariant. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerRef: any;
  /** Disabled state */
  disabled: boolean;
}

/**
 * DropdownBase - base component with Render Props API
 *
 * Simple base component for creating dropdown menus.
 * For automatic item rendering use the Dropdown component.
 * For more complex/custom scenarios use DropdownCompound.
 *
 * @example
 * <DropdownBase
 *   trigger={({ isOpen, onClick, triggerRef, disabled }) => (
 *     <button onClick={onClick} ref={triggerRef} disabled={disabled}>
 *       Menu {isOpen ? '▲' : '▼'}
 *     </button>
 *   )}
 *   menu={<div>Content</div>}
 *   placement="bottom"
 * />
 */

export interface DropdownBaseProps {
  /**
   * Render function for the trigger element
   * Receives an object with isOpen, onClick, triggerRef, disabled for full control
   */
  trigger: (props: DropdownBaseTriggerProps) => ReactNode;

  /**
   * Menu content
   */
  menu: ReactNode;

  /**
   * Placement direction
   * @default 'bottom'
   */
  placement?: DropdownPlacement;

  /**
   * Offset from trigger (px)
   * @default 8
   */
  offset?: number;

  /**
   * z-index for the menu
   * @default 10100
   */
  zIndex?: number;

  /**
   * Controlled state
   */
  open?: boolean;

  /**
   * Callback on state change
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Uncontrolled initial state
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Additional classes for the menu
   */
  menuClassName?: string;

  /**
   * Stretch menu to match trigger element width
   * @default false
   */
  matchTriggerWidth?: boolean;

  /**
   * Whether to use Portal for rendering the menu
   * @default true
   */
  usePortal?: boolean;

  /**
   * Disabled state for the trigger
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to close on scroll
   * @default true
   */
  closeOnScroll?: boolean;
}

/**
 * Inner component that uses DropdownContext
 * Contains dropdown toggle logic and passes it through render props
 */
function DropdownBaseInner({
  trigger,
  menu,
  placement,
  offset,
  zIndex,
  menuClassName,
  matchTriggerWidth,
  usePortal,
  disabled = false,
}: {
  trigger: (props: DropdownBaseTriggerProps) => ReactNode;
  menu: ReactNode;
  placement?: DropdownPlacement;
  offset?: number;
  zIndex?: number;
  menuClassName?: string;
  matchTriggerWidth?: boolean;
  usePortal?: boolean;
  disabled?: boolean;
}) {
  const { isOpen, toggle, triggerRef } = useDropdownContext();

  const handleToggle = useCallback(() => {
    if (!disabled) toggle();
  }, [toggle, disabled]);

  const triggerProps: DropdownBaseTriggerProps = {
    isOpen,
    onClick: handleToggle,
    triggerRef,
    disabled,
  };

  return (
    <>
      {trigger(triggerProps)}
      <DropdownCompound.Menu
        placement={placement}
        offset={offset}
        zIndex={zIndex}
        className={menuClassName}
        matchTriggerWidth={matchTriggerWidth}
        usePortal={usePortal}
      >
        {menu}
      </DropdownCompound.Menu>
    </>
  );
}

export function DropdownBase({
  trigger,
  menu,
  placement,
  offset,
  zIndex,
  open,
  onOpenChange,
  defaultOpen = false,
  menuClassName,
  matchTriggerWidth,
  usePortal,
  disabled = false,
  closeOnScroll,
}: DropdownBaseProps) {
  return (
    <DropdownCompound
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      closeOnScroll={closeOnScroll}
    >
      <DropdownBaseInner
        trigger={trigger}
        menu={menu}
        placement={placement}
        offset={offset}
        zIndex={zIndex}
        menuClassName={menuClassName}
        matchTriggerWidth={matchTriggerWidth}
        usePortal={usePortal}
        disabled={disabled}
      />
    </DropdownCompound>
  );
}

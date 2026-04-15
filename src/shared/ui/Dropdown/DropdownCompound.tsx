'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { DropdownContext } from './DropdownContext';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownMenu } from './DropdownMenu';
import type { DropdownCompoundRootProps } from './Dropdown.types';

/**
 * DropdownCompound - Compound Components API
 *
 * For complex/custom scenarios where full control is needed.
 * For simple cases use the main Dropdown component.
 *
 * @example
 * <DropdownCompound>
 *   <DropdownCompound.Trigger>
 *     <button>Open</button>
 *   </DropdownCompound.Trigger>
 *   <DropdownCompound.Menu>
 *     <div>Content</div>
 *   </DropdownCompound.Menu>
 * </DropdownCompound>
 */
export function DropdownCompound({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnScroll = true,
}: DropdownCompoundRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newOpen);
      } else {
        setUncontrolledOpen(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  const toggle = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(!open);
    } else {
      setUncontrolledOpen((prev) => !prev);
    }
  }, [isControlled, onOpenChange, open]);

  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggle,
      triggerRef,
      menuRef,
      closeOnClickOutside,
      closeOnEscape,
      closeOnScroll,
    }),
    [
      isOpen,
      setIsOpen,
      toggle,
      closeOnClickOutside,
      closeOnEscape,
      closeOnScroll,
    ]
  );

  return <DropdownContext value={contextValue}>{children}</DropdownContext>;
}

DropdownCompound.Trigger = DropdownTrigger;
DropdownCompound.Menu = DropdownMenu;

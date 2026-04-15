'use client';

import { useCallback } from 'react';
import { useDropdownContext } from './DropdownContext';
import type { DropdownTriggerProps } from './Dropdown.types';

export function DropdownTrigger({
  children,
  className = '',
  disabled = false,
}: DropdownTriggerProps) {
  const { isOpen, toggle, triggerRef } = useDropdownContext();

  const handleClick = useCallback(() => {
    if (!disabled) toggle();
  }, [disabled, toggle]);

  const content = typeof children === 'function' ? children(isOpen) : children;

  return (
    <button
      type="button"
      ref={triggerRef as React.RefObject<HTMLButtonElement | null>}
      onClick={handleClick}
      className={className || undefined}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-haspopup="true"
      aria-expanded={isOpen}
      data-dropdown-trigger=""
    >
      {content}
    </button>
  );
}

'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/shared/hooks';
import { useDropdownContext } from './DropdownContext';
import { useDropdownPosition } from './useDropdownPosition';
import type { DropdownMenuProps } from './Dropdown.types';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [role="menuitem"]';

export function DropdownMenu({
  children,
  className = '',
  style: styleProp,
  placement = 'bottom',
  offset = 8,
  zIndex = 10100,
  usePortal = true,
  matchTriggerWidth = false,
}: DropdownMenuProps) {
  const {
    isOpen,
    setIsOpen,
    triggerRef,
    menuRef,
    closeOnClickOutside,
    closeOnEscape,
    closeOnScroll,
  } = useDropdownContext();

  // Compute position with viewport correction
  const position = useDropdownPosition({
    placement,
    offset,
    triggerRef,
    menuRef,
    isOpen,
  });

  // Click outside handler
  useClickOutside(
    menuRef,
    (e) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    isOpen && closeOnClickOutside
  );

  // Close on external scroll (ignores scroll inside the menu itself)
  useEffect(() => {
    if (!isOpen || !closeOnScroll) return;

    const handleScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('scroll', handleScroll, true);
    return () => document.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, closeOnScroll, setIsOpen, menuRef]);

  // Escape handler (global — works even when focus is on trigger)
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, setIsOpen, triggerRef]);

  // Auto-focus first focusable element when menu opens
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableElements =
      menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const timer = setTimeout(() => focusableElements[0]?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isOpen, menuRef]);

  // Keyboard navigation scoped to the menu element
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!menuRef.current) return;

      const focusableElements =
        menuRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      const elements = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = elements.indexOf(
        document.activeElement as HTMLElement
      );

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          if (elements.length === 0) break;
          if (e.shiftKey) {
            const prevIndex =
              (currentIndex - 1 + elements.length) % elements.length;
            elements[prevIndex]?.focus();
          } else {
            const nextIndex = (currentIndex + 1) % elements.length;
            elements[nextIndex]?.focus();
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % elements.length;
          elements[nextIndex]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex =
            (currentIndex - 1 + elements.length) % elements.length;
          elements[prevIndex]?.focus();
          break;
        }
        case 'Home':
          e.preventDefault();
          elements[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          elements[elements.length - 1]?.focus();
          break;
      }
    },
    [menuRef]
  );

  // Use actual placement (after auto-flip) for animation direction
  const primaryAxis = position.placement.split('-')[0];
  const animY = primaryAxis === 'bottom' ? -10 : primaryAxis === 'top' ? 10 : 0;
  const animX = primaryAxis === 'right' ? -10 : primaryAxis === 'left' ? 10 : 0;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <m.div
          ref={menuRef as React.RefObject<HTMLDivElement | null>}
          className={className || undefined}
          role="menu"
          onKeyDown={handleKeyDown}
          style={{
            position: 'fixed',
            top: position.top,
            bottom: position.bottom,
            left: position.left,
            right: position.right,
            zIndex,
            ...(matchTriggerWidth && triggerRef.current
              ? { width: triggerRef.current.getBoundingClientRect().width }
              : {}),
            ...styleProp,
          }}
          initial={{ opacity: 0, y: animY, x: animX, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: animY, x: animX, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );

  if (usePortal && typeof document !== 'undefined') {
    return createPortal(menuContent, document.body);
  }
  return menuContent;
}

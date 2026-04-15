'use client';

/**
 * SidebarItemBase — shared interactive button primitive for all sidebar items.
 *
 * Encapsulates: group class, BASE_INTERACTIVE (transitions + focus), and
 * getStateClasses() (state-dependent text/bg colors). All sidebar interactive
 * elements (SidebarNavItem, SidebarNavSubitem, SidebarLogo) build on this.
 */

import React from 'react';

import { cn } from '@/shared/utils/cn';

import { BASE_INTERACTIVE, getStateClasses } from './SidebarNav.styles';

interface SidebarItemBaseProps {
  isActive?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
  'data-testid'?: string;
}

const SidebarItemBase = React.forwardRef<
  HTMLButtonElement,
  SidebarItemBaseProps
>(
  (
    {
      isActive = false,
      isHighlighted,
      onClick,
      onMouseEnter,
      onMouseLeave,
      className,
      children,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      className={cn(
        'group',
        BASE_INTERACTIVE,
        getStateClasses(isActive, isHighlighted),
        className
      )}
    >
      {children}
    </button>
  )
);

SidebarItemBase.displayName = 'SidebarItemBase';

export default SidebarItemBase;

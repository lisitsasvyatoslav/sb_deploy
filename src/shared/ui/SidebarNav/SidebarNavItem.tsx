'use client';

import React, { useState, useRef } from 'react';

import IconButton from '@/shared/ui/IconButton';
import { cn } from '@/shared/utils/cn';
import Tooltip from '@/shared/ui/Tooltip';

import { type SidebarNavItemProps } from './SidebarNav.types';
import {
  BASE_INTERACTIVE,
  getStateClasses,
  ICON_WRAPPER_CLASS,
} from './SidebarNav.styles';
import { renderIcon } from './SidebarNav.utils';
import SidebarItemBase from './SidebarItemBase';

/**
 * SidebarNavItem — Sidebar/Item/Main/Default + Mini
 *
 * Figma nodes: 65719:32664 (itemSidebar component set container)
 *
 * Main sidebar navigation item with optional icon, label, and right area.
 * When `isCollapsed` is true, renders icon-only mode (formerly SidebarNavItemMini).
 */
const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon,
  label,
  showIcon = true,
  rightArea,
  isExpanded,
  showChevron = false,
  isActive = false,
  isHighlighted,
  isCollapsed = false,
  tooltip,
  onClick,
  onToggleExpand,
  className,
  'data-testid': dataTestId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  /* ── Icon ── */
  const iconSlot = showIcon && icon && (
    <div className={ICON_WRAPPER_CLASS}>{renderIcon(icon)}</div>
  );

  /* ── Collapsed (mini) mode ── */
  if (isCollapsed) {
    const collapsedContent = (
      <SidebarItemBase
        isActive={isActive}
        isHighlighted={isHighlighted}
        onClick={onClick}
        aria-label={label}
        data-testid={dataTestId}
        className={cn(
          'flex items-center justify-center p-spacing-8 w-full',
          className
        )}
      >
        {iconSlot}
      </SidebarItemBase>
    );

    if (tooltip) {
      return (
        <div
          ref={anchorRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {collapsedContent}
          <Tooltip
            content={tooltip}
            show={isHovered}
            portal
            anchorRef={anchorRef}
            position="right"
          />
        </div>
      );
    }

    return collapsedContent;
  }

  /* ── Expanded (default) mode ── */
  const expandedClassName = cn(
    'group',
    'flex items-center gap-spacing-12 py-spacing-8 pr-spacing-12 pl-spacing-14 w-full',
    'text-14 font-regular leading-20 tracking-tight-1',
    BASE_INTERACTIVE,
    getStateClasses(isActive, isHighlighted),
    className
  );

  /* ── Label ── */
  const labelSlot = (
    <span className="flex-1 min-w-0 truncate text-left">{label}</span>
  );

  /* ── Chevron ── */
  const chevronSlot = showChevron && (
    <IconButton
      icon={isExpanded ? 'chevronDownSmall' : 'chevronRightSmall'}
      size="sm"
      className="flex-shrink-0 text-current"
      ariaLabel={isExpanded ? 'Collapse' : 'Expand'}
      onClick={
        onToggleExpand
          ? (e) => {
              e.stopPropagation();
              onToggleExpand();
            }
          : undefined
      }
    />
  );

  const trailing = (
    <div className="flex-shrink-0 flex items-center gap-spacing-4">
      {rightArea}
      {chevronSlot}
    </div>
  );

  /* When trailing contains interactive elements (e.g. Switch, clickable chevron), use div to avoid nested <button> */
  if (rightArea || onToggleExpand) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        data-testid={dataTestId}
        className={expandedClassName}
      >
        {iconSlot}
        {labelSlot}
        {trailing}
      </div>
    );
  }

  return (
    <SidebarItemBase
      isActive={isActive}
      isHighlighted={isHighlighted}
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        'flex items-center gap-spacing-12 py-spacing-8 pr-spacing-12 pl-spacing-14 w-full',
        'text-14 font-regular leading-20 tracking-tight-1',
        className
      )}
    >
      {iconSlot}
      {labelSlot}
      {trailing}
    </SidebarItemBase>
  );
};

export default React.memo(SidebarNavItem);

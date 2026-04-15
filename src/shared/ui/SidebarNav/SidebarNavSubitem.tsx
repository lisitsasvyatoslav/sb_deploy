'use client';

import React from 'react';

import { cn } from '@/shared/utils/cn';

import { type SidebarNavSubitemProps } from './SidebarNav.types';
import SidebarItemBase from './SidebarItemBase';

/**
 * SidebarNavSubitem — Sidebar/Subitem/Main/Default
 *
 * Figma node: 55308:5705
 *
 * Sub-item for sidebar navigation, indented to align with parent item's label.
 * Right area content is visible on hover via group-hover pattern.
 */
const SidebarNavSubitem: React.FC<SidebarNavSubitemProps> = ({
  label,
  rightArea,
  isActive = false,
  onClick,
  className,
  'data-testid': dataTestId,
}) => {
  return (
    <SidebarItemBase
      isHighlighted={isActive}
      onClick={onClick}
      data-testid={dataTestId}
      className={cn(
        'flex items-center gap-spacing-12 py-spacing-6 pr-spacing-12 w-full',
        'pl-[46px]', // 14px parent-pl + 12px gap + 20px icon
        'text-14 font-regular leading-20 tracking-tight-1',
        className
      )}
    >
      <span className="flex-1 min-w-0 truncate text-left">{label}</span>

      {rightArea && (
        <div
          className={cn(
            'flex-shrink-0 flex items-center transition-opacity duration-150',
            !isActive && 'opacity-0 group-hover:opacity-100'
          )}
        >
          {rightArea}
        </div>
      )}
    </SidebarItemBase>
  );
};

export default React.memo(SidebarNavSubitem);

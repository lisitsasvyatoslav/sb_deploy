'use client';

import React, { useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { cn } from '@/shared/utils/cn';

import { type SidebarNavGroupProps } from './SidebarNav.types';
import SidebarNavItem from './SidebarNavItem';

/**
 * SidebarNavGroup — Sidebar/Items
 *
 * Figma node: 55302:11212
 *
 * Container with expand/collapse for a main navigation item and its sub-items.
 * Uses Framer Motion for smooth height animation.
 */
const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  item,
  children,
  isExpanded = false,
  isCollapsed = false,
  tooltip,
  onToggle,
  onToggleExpand,
  className,
  'data-testid': dataTestId,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (isCollapsed) {
    return (
      <SidebarNavItem
        {...item}
        isCollapsed
        tooltip={tooltip}
        onClick={onToggle}
        data-testid={dataTestId}
      />
    );
  }

  return (
    <div
      data-testid={dataTestId}
      className={cn('flex flex-col', isExpanded && 'min-h-0', className)}
    >
      <SidebarNavItem
        {...item}
        showChevron
        isExpanded={isExpanded}
        onClick={onToggle}
        onToggleExpand={onToggleExpand}
      />

      <AnimatePresence initial={false}>
        {isExpanded && children && (
          <m.div
            ref={contentRef}
            className="flex flex-col overflow-hidden min-h-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
              if (contentRef.current) {
                contentRef.current.style.height = '';
              }
            }}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarNavGroup;

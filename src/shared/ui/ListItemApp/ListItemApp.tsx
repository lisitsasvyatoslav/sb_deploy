'use client';

import React, { forwardRef } from 'react';

import { cn } from '@/shared/utils/cn';

import { DropdownBase, DROPDOWN_CONTAINER_CLASSES } from '@/shared/ui/Dropdown';

import { ListItemAppProps, ListItemAppState } from './ListItemApp.types';

/**
 * ListItemApp — universal list item for app screens.
 *
 * Figma node: 9320:7913
 *
 * Slots:
 * - leading: Avatar, BaseImage, Icon, or any ReactNode
 * - title + caption: text content (fills available space)
 * - trailing: Checkbox, RadioButton, Switch, IconButton, or any ReactNode
 *
 * States: Enabled (default), Focused (bg + 0.7 opacity), Active (bg), Disabled (0.35 opacity)
 *
 * When `dropdownMenu` is provided, the item becomes a dropdown trigger
 * and automatically switches to Active state when the dropdown is open.
 */

const STATE_CONFIG: Record<ListItemAppState, string> = {
  enabled: '',
  focused: 'bg-blackinverse-a4 opacity-statefocused',
  active: 'bg-blackinverse-a6',
  disabled: 'opacity-statedisabled pointer-events-none',
} as const;

type ListItemAppContentProps = Omit<
  ListItemAppProps,
  | 'dropdownMenu'
  | 'dropdownMenuClassName'
  | 'dropdownPlacement'
  | 'dropdownMatchTriggerWidth'
> & { resolvedState?: ListItemAppState };

/** Inner rendering of list item (shared between plain and dropdown modes) */
const ListItemAppContent = forwardRef<HTMLDivElement, ListItemAppContentProps>(
  (
    {
      leading,
      title,
      caption,
      trailing,
      state = 'enabled',
      resolvedState,
      onClick,
      className,
      'data-testid': dataTestId,
    },
    ref
  ) => {
    const effectiveState = resolvedState ?? state;
    const isDisabled = effectiveState === 'disabled';

    return (
      <div
        ref={ref}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !isDisabled ? 0 : undefined}
        onClick={!isDisabled ? onClick : undefined}
        onKeyDown={
          onClick && !isDisabled
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        aria-disabled={isDisabled || undefined}
        data-testid={dataTestId}
        className={cn(
          'flex items-center gap-spacing-12 py-spacing-8 px-spacing-16 w-full transition-all duration-150 outline-none',
          STATE_CONFIG[effectiveState],
          onClick &&
            !isDisabled &&
            'cursor-pointer focus-visible:bg-blackinverse-a4 focus-visible:opacity-statefocused',
          className
        )}
      >
        {leading && <div className="flex-shrink-0">{leading}</div>}

        <div className="flex flex-col gap-spacing-2 flex-1 min-w-0">
          <span className="text-desktop-14 font-semibold leading-20 tracking-tight-1 text-blackinverse-a100 text-ellipsis whitespace-nowrap">
            {title}
          </span>
          {caption &&
            (typeof caption === 'string' ? (
              <span className="text-desktop-12 font-medium leading-16 tracking-tight-1 text-blackinverse-a56 text-ellipsis whitespace-nowrap">
                {caption}
              </span>
            ) : (
              <div className="text-desktop-12 font-medium leading-16 tracking-tight-1 text-blackinverse-a56">
                {caption}
              </div>
            ))}
        </div>

        {trailing && (
          <div className="flex-shrink-0 flex items-center">{trailing}</div>
        )}
      </div>
    );
  }
);

ListItemAppContent.displayName = 'ListItemAppContent';

const ListItemApp: React.FC<ListItemAppProps> = ({
  dropdownMenu,
  dropdownMenuClassName,
  dropdownPlacement = 'bottom',
  dropdownMatchTriggerWidth,
  ...props
}) => {
  if (dropdownMenu) {
    return (
      <DropdownBase
        trigger={({ onClick, triggerRef, isOpen }) => (
          <ListItemAppContent
            {...props}
            ref={triggerRef}
            onClick={onClick}
            resolvedState={isOpen ? 'active' : props.state}
          />
        )}
        menu={dropdownMenu}
        menuClassName={dropdownMenuClassName ?? DROPDOWN_CONTAINER_CLASSES}
        placement={dropdownPlacement}
        matchTriggerWidth={dropdownMatchTriggerWidth}
      />
    );
  }

  return <ListItemAppContent {...props} />;
};

export default ListItemApp;

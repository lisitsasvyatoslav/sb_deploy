'use client'; // Required: child components (Button, IconButton) are client components

import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import IconButton from '@/shared/ui/IconButton';
import { cn } from '@/shared/utils/cn';
import type {
  ControlsButtonItem,
  ControlsIconButtonItem,
  ControlsPanelProps,
  DropdownConfig,
} from './ControlsPanel.types';

/**
 * ControlsPanel — horizontal toolbar of ghost buttons, icon buttons and dividers.
 *
 * Discrimination via `kind`:
 * - `kind: 'icon-button'` → IconButton without a text label
 * - `kind: 'custom'`      → arbitrary ReactNode via `content` prop
 * - `kind: 'button'` or omitted → ghost Button with text label
 * - `'divider'`           → visual separator
 *
 * Ghost/sm defaults applied automatically to Button items.
 *
 * Figma node: 59114:3689
 */

function renderDropdown(
  key: string | number,
  dropdown: DropdownConfig,
  renderButton: (onClick: () => void) => React.ReactNode
) {
  return (
    <Dropdown
      key={key}
      placement={dropdown.placement ?? 'bottom'}
      items={dropdown.items}
      selectedValue={dropdown.selectedValue}
      onSelect={dropdown.onSelect}
      header={dropdown.header}
      trigger={({ onClick, triggerRef }) => (
        <span ref={triggerRef} className="inline-flex">
          {renderButton(onClick)}
        </span>
      )}
    />
  );
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  items,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-row items-center',
        'p-spacing-2 rounded-radius-2',
        'bg-background-gray_high',
        'ring-1 ring-stroke-a4',
        'shadow-effects-panel backdrop-blur-effects-panel',
        className
      )}
      data-testid={dataTestId}
    >
      {items.map((item, index) => {
        if (item === 'divider') {
          return (
            <span
              key={index}
              className="w-base-1 h-spacing-16 bg-wrapper-a6 flex-shrink-0"
              aria-hidden="true"
            />
          );
        }

        const key = item.id ?? index;

        if (item.kind === 'custom') {
          return <React.Fragment key={key}>{item.content}</React.Fragment>;
        }

        if (item.kind === 'icon-button') {
          const {
            kind: _kind,
            id: _id,
            dropdown,
            ...iconButtonProps
          } = item as ControlsIconButtonItem;
          if (dropdown) {
            return renderDropdown(key, dropdown, (onClick) => (
              <IconButton
                size={16}
                {...iconButtonProps}
                onClick={onClick}
                className={cn(
                  'w-spacing-32 h-spacing-32',
                  iconButtonProps.className
                )}
              />
            ));
          }
          return (
            <IconButton
              key={key}
              size={16}
              {...iconButtonProps}
              className={cn(
                'w-spacing-32 h-spacing-32',
                iconButtonProps.className
              )}
            />
          );
        }

        // Default: button item (kind === 'button' or omitted)

        const {
          kind: _kind,
          id: _id,
          dropdown,
          children,
          ...buttonProps
        } = item as ControlsButtonItem;
        if (dropdown) {
          return renderDropdown(key, dropdown, (onClick) => (
            <Button
              variant="ghost"
              size="sm"
              {...buttonProps}
              iconRight="chevronDown"
              onClick={onClick}
            >
              {children}
            </Button>
          ));
        }
        return (
          <Button key={key} variant="ghost" size="sm" {...buttonProps}>
            {children}
          </Button>
        );
      })}
    </div>
  );
};

export default ControlsPanel;

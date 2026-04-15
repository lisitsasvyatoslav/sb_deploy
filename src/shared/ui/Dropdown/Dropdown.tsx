'use client';

import {
  DropdownBase,
  DropdownBaseProps,
  DropdownBaseTriggerProps,
} from './DropdownBase';
import { useDropdownContext } from './DropdownContext';
import React, { useCallback } from 'react';
import { DropdownItemButton } from './DropdownItemButton';
import type { DropdownItem } from './DropdownItemButton';
import { cn } from '@/shared/utils/cn';

/** Standard menu container styles (border, shadow, blur) */
export const DROPDOWN_CONTAINER_CLASSES =
  'rounded-radius-4 border border-blackinverse-a4 bg-background-gray_high shadow-modal backdrop-blur-effects-modal overflow-hidden';

/**
 * Dropdown - component with automatic items rendering
 *
 * Figma node: 55089:9408
 *
 * For standard item lists. For custom rendering — use DropdownBase or DropdownCompound.
 *
 * @example
 * <Dropdown
 *   trigger={({ isOpen, onClick, triggerRef }) => (
 *     <button onClick={onClick} ref={triggerRef}>Select</button>
 *   )}
 *   items={[
 *     { label: 'Edit', value: '1', leftIcon: 'edit' },
 *     { label: 'Delete', value: '2', leftIcon: 'trash', variant: 'negative' },
 *   ]}
 *   selectedValue="1"
 *   onSelect={(value) => console.log(value)}
 * />
 */

export interface DropdownProps extends Omit<
  DropdownBaseProps,
  'menu' | 'trigger'
> {
  trigger: (props: DropdownBaseTriggerProps) => React.ReactNode;
  items: DropdownItem[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  header?: React.ReactNode;
  className?: string;
}

/** Inner menu content that consumes context for auto-close */
function DropdownMenuContent({
  items,
  selectedValue,
  onSelect,
  header,
  className,
}: Pick<
  DropdownProps,
  'items' | 'selectedValue' | 'onSelect' | 'header' | 'className'
>) {
  const { setIsOpen } = useDropdownContext();

  const handleSelect = useCallback(
    (value: string) => {
      onSelect?.(value);
      setIsOpen(false);
    },
    [onSelect, setIsOpen]
  );

  return (
    <>
      {header}
      <div className={cn('py-spacing-6', className)}>
        {items.map((item) => (
          <DropdownItemButton
            key={item.value}
            item={item}
            isActive={item.value === selectedValue}
            onClick={() => handleSelect(item.value)}
          />
        ))}
      </div>
    </>
  );
}

export function Dropdown({
  items,
  selectedValue,
  onSelect,
  menuClassName,
  header,
  className,
  ...baseProps
}: DropdownProps) {
  return (
    <DropdownBase
      {...baseProps}
      menu={
        <DropdownMenuContent
          items={items}
          selectedValue={selectedValue}
          onSelect={onSelect}
          header={header}
          className={className}
        />
      }
      menuClassName={cn(DROPDOWN_CONTAINER_CLASSES, menuClassName)}
    />
  );
}

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import { DropdownMultiSelect } from '@/shared/ui/Dropdown';

export interface CheckboxDropdownItem {
  id: string;
  label: string;
}

interface CheckboxDropdownFilterProps {
  items: CheckboxDropdownItem[];
  /** null = all selected, string[] = specific ids selected */
  selectedIds: string[] | null;
  onChange: (ids: string[] | null) => void;
  /** Label for the "All" toggle option */
  allLabel: string;
  /** Label shown when nothing is selected */
  noneLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * CheckboxDropdownFilter — inputMd-styled multi-select dropdown
 *
 * Figma node: 5176:12570
 *
 * Thin wrapper around DropdownMultiSelect that provides the inputMd trigger.
 */
const CheckboxDropdownFilter: React.FC<CheckboxDropdownFilterProps> = ({
  items,
  selectedIds,
  onChange,
  allLabel,
  noneLabel,
  disabled = false,
  className = '',
}) => {
  // Map id-based API to value-based API for DropdownMultiSelect
  const multiSelectItems = useMemo(
    () => items.map((item) => ({ label: item.label, value: item.id })),
    [items]
  );

  return (
    <div className={cn('relative', className)}>
      <DropdownMultiSelect
        items={multiSelectItems}
        selectedValues={selectedIds}
        onChange={onChange}
        allLabel={allLabel}
        noneLabel={noneLabel}
        disabled={disabled}
        matchTriggerWidth
        placement="bottom"
        offset={8}
        trigger={({
          isOpen,
          onClick,
          triggerRef,
          disabled: isDisabled,
          triggerText,
        }) => (
          <button
            ref={triggerRef}
            onClick={onClick}
            disabled={isDisabled}
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className={cn(
              'flex items-center w-full',
              'py-spacing-10 px-spacing-12',
              'gap-spacing-8',
              'rounded-radius-2',
              'bg-blackinverse-a8',
              'transition-colors duration-360',
              'cursor-pointer',
              isDisabled && 'opacity-statedisabled cursor-not-allowed'
            )}
          >
            <span className="flex-1 text-left text-14 leading-20 font-normal tracking-tight-1 text-blackinverse-a56 truncate">
              {triggerText}
            </span>
            <Icon
              variant="chevronDownSmall"
              size={20}
              className={cn(
                'shrink-0 aspect-square transition-transform duration-200 text-blackinverse-a56',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      />
    </div>
  );
};

export default CheckboxDropdownFilter;

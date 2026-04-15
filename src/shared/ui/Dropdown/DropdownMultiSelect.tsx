'use client';

import React, { useCallback, useMemo } from 'react';
import {
  DropdownBase,
  DropdownBaseProps,
  DropdownBaseTriggerProps,
} from './DropdownBase';
import { DROPDOWN_CONTAINER_CLASSES } from './Dropdown';
import {
  DROPDOWN_ITEM_CLASSES,
  getItemTextClasses,
} from './DropdownItemButton';
import Checkbox from '@/shared/ui/Checkbox';
import { cn } from '@/shared/utils/cn';

export interface DropdownMultiSelectItem {
  label: string;
  value: string;
}

export interface DropdownMultiSelectProps extends Omit<
  DropdownBaseProps,
  'menu' | 'trigger'
> {
  trigger: (
    props: DropdownBaseTriggerProps & { triggerText: string }
  ) => React.ReactNode;
  items: DropdownMultiSelectItem[];
  /** null = all selected, string[] = specific values selected */
  selectedValues: string[] | null;
  onChange: (values: string[] | null) => void;
  /** If provided, shows an "All" toggle as the first item */
  allLabel?: string;
  /** Label shown when nothing is selected (defaults to allLabel) */
  noneLabel?: string;
  menuClassName?: string;
}

/**
 * DropdownMultiSelect — multi-select dropdown with checkboxes
 *
 * Figma node: 5176:13753
 *
 * Like Dropdown, but stays open on item click, renders checkboxes,
 * and supports multi-select with optional "All" toggle.
 *
 * @example
 * <DropdownMultiSelect
 *   trigger={({ onClick, triggerRef, triggerText }) => (
 *     <button onClick={onClick} ref={triggerRef}>{triggerText}</button>
 *   )}
 *   items={[
 *     { label: 'Finam', value: 'finam' },
 *     { label: 'T-bank', value: 'tbank' },
 *   ]}
 *   selectedValues={null}
 *   onChange={(values) => console.log(values)}
 *   allLabel="Все"
 * />
 */
export function DropdownMultiSelect({
  items,
  selectedValues,
  onChange,
  allLabel,
  noneLabel,
  menuClassName,
  trigger,
  ...baseProps
}: DropdownMultiSelectProps) {
  const allSelected = selectedValues === null;
  const noneSelected = selectedValues !== null && selectedValues.length === 0;

  const isItemSelected = useCallback(
    (value: string) =>
      selectedValues === null || selectedValues.includes(value),
    [selectedValues]
  );

  const handleAllToggle = useCallback(() => {
    onChange(allSelected ? [] : null);
  }, [allSelected, onChange]);

  const handleItemToggle = useCallback(
    (value: string) => {
      if (selectedValues === null) {
        // Was "all" — deselect this one item
        const remaining = items.map((i) => i.value).filter((v) => v !== value);
        onChange(remaining);
        return;
      }

      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        const newValues = [...selectedValues, value];
        // If all items are now selected, normalize to null (= "All")
        if (newValues.length === items.length) {
          onChange(null);
        } else {
          onChange(newValues);
        }
      }
    },
    [selectedValues, items, onChange]
  );

  const triggerText = useMemo(() => {
    if (!allLabel) {
      if (selectedValues === null) return '';
      return selectedValues
        .map((v) => items.find((i) => i.value === v)?.label)
        .filter(Boolean)
        .join(', ');
    }
    if (allSelected) return allLabel;
    if (noneSelected) return noneLabel ?? allLabel;
    const labels = selectedValues
      .map((v) => items.find((i) => i.value === v)?.label)
      .filter(Boolean)
      .join(', ');
    return labels || allLabel;
  }, [selectedValues, items, allLabel, allSelected, noneSelected]);

  const menu = (
    <div
      className={cn(DROPDOWN_CONTAINER_CLASSES, 'py-spacing-6', menuClassName)}
    >
      {allLabel && (
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={allSelected ? 'true' : noneSelected ? 'false' : 'mixed'}
          onClick={handleAllToggle}
          className={DROPDOWN_ITEM_CLASSES}
        >
          <span className={getItemTextClasses('default', allSelected)}>
            {allLabel}
          </span>
          <div className="flex items-center justify-center p-spacing-8 shrink-0 pointer-events-none">
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && !noneSelected}
              onChange={handleAllToggle}
              size="md"
              variant="accent"
            />
          </div>
        </button>
      )}

      {items.map((item) => {
        const checked = isItemSelected(item.value);
        return (
          <button
            key={item.value}
            type="button"
            role="menuitemcheckbox"
            aria-checked={checked}
            onClick={() => handleItemToggle(item.value)}
            className={DROPDOWN_ITEM_CLASSES}
          >
            <span className={getItemTextClasses('default', checked)}>
              {item.label}
            </span>
            <div className="flex items-center justify-center p-spacing-8 shrink-0 pointer-events-none">
              <Checkbox
                checked={checked}
                onChange={() => handleItemToggle(item.value)}
                size="md"
                variant="accent"
              />
            </div>
          </button>
        );
      })}
    </div>
  );

  const wrappedTrigger = useCallback(
    (props: DropdownBaseTriggerProps) => trigger({ ...props, triggerText }),
    [trigger, triggerText]
  );

  return <DropdownBase {...baseProps} trigger={wrappedTrigger} menu={menu} />;
}

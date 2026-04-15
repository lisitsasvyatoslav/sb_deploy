'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import type { DropdownItem } from '@/shared/ui/Dropdown';

type PositionsDateRangeFilterSize = 'sm' | 'md';

interface PositionsDateRangeFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  /** sm = inputSm (32px, text-10), md = inputMd (hug, text-14). Default: 'sm' */
  size?: PositionsDateRangeFilterSize;
}

/**
 * PositionsDateRangeFilter — date range picker for PositionsBlockV2
 *
 * Figma node: 2001:1990 (inputSm)
 *
 * Thin wrapper around Dropdown that provides inputSm/inputMd trigger
 * and date range items with i18n.
 */
const PositionsDateRangeFilter: React.FC<PositionsDateRangeFilterProps> = ({
  value = 'all',
  onChange,
  className = '',
  disabled = false,
  size = 'sm',
}) => {
  const { t } = useTranslation('statistics');

  const isMd = size === 'md';

  const items: DropdownItem[] = useMemo(
    () => [
      { label: t('dateRange.allTime'), value: 'all' },
      { label: t('dateRange.twoDays'), value: '2days' },
      { label: t('dateRange.week'), value: 'week' },
      { label: t('dateRange.oneMonth'), value: 'month' },
      { label: t('dateRange.sixMonths'), value: '6month' },
      { label: t('dateRange.oneYear'), value: 'year' },
      { label: t('dateRange.threeYears'), value: '3year' },
    ],
    [t]
  );

  const selectedLabel =
    items.find((r) => r.value === value)?.label ?? items[0].label;

  return (
    <div className={cn('relative', className)}>
      <Dropdown
        trigger={({ isOpen, onClick, triggerRef, disabled: isDisabled }) => (
          <button
            ref={triggerRef}
            onClick={onClick}
            disabled={isDisabled}
            type="button"
            className={cn(
              isMd ? 'flex items-center w-full' : 'inline-flex items-center',
              'rounded-radius-2',
              'transition-colors duration-360',
              'cursor-pointer',
              isMd
                ? 'py-spacing-10 px-spacing-12 gap-spacing-8 bg-blackinverse-a8'
                : 'h-spacing-32 py-spacing-6 px-spacing-8 gap-spacing-6',
              isDisabled && 'opacity-statedisabled cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'font-normal line-clamp-1',
                isMd
                  ? 'text-14 leading-20 tracking-tight-1 text-blackinverse-a56 flex-1 text-left'
                  : 'text-10 leading-3 text-blackinverse-a100'
              )}
            >
              {selectedLabel}
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
        items={items}
        selectedValue={value}
        onSelect={onChange}
        disabled={disabled}
        matchTriggerWidth={isMd}
        placement="bottom"
        offset={8}
      />
    </div>
  );
};

export default PositionsDateRangeFilter;

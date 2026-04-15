'use client';

import { useClickOutside } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import React, { useMemo, useRef, useState } from 'react';

interface DateRange {
  label: string;
  value: string;
}

interface DateRangeFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Date range filter dropdown component
 * Matches Figma design with radio buttons
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value = 'all',
  onChange,
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation('statistics');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const DATE_RANGES: DateRange[] = useMemo(
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

  const selectedRange =
    DATE_RANGES.find((range) => range.value === value) || DATE_RANGES[0];

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleSelect = (rangeValue: string) => {
    onChange?.(rangeValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 text-sm transition-colors w-[160px] h-[48px] rounded-lg  ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="theme-text-primary">{selectedRange.label}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.902 0.968C1.196 0.637 1.701 0.608 2.032 0.901L6 4.429L9.969 0.901C10.299 0.608 10.805 0.637 11.098 0.968C11.392 1.298 11.362 1.804 11.032 2.097L6.532 6.097C6.229 6.367 5.772 6.367 5.469 6.097L0.969 2.097C0.638 1.804 0.609 1.298 0.902 0.968Z"
            fill="currentColor"
            className="theme-text-primary"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-[280px] theme-surface rounded-xl theme-border shadow-[0_15px_30px_rgba(57,57,66,0.16)] z-50 overflow-hidden">
          <div className="py-2">
            {DATE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => handleSelect(range.value)}
                className="w-full flex items-center gap-3 px-4 py-2.5 theme-bg-hover transition-colors text-left"
              >
                {/* Radio button */}
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border-2 border-text-primary">
                  {value === range.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />
                  )}
                </div>

                {/* Label */}
                <span className="text-sm theme-text-primary">
                  {range.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;

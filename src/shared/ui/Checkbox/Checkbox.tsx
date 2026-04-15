'use client';

import classNames from 'classnames';
import React from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'accent' | 'mono';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  indeterminate?: boolean;
  /** sm = 16×16, md = 20×20, lg = 24×24. Default: 'md' */
  size?: CheckboxSize;
  /** accent = brand purple (default), mono = black/white */
  variant?: CheckboxVariant;
  'aria-label'?: string;
  'data-testid'?: string;
}

// Check icon — white checkmark, fits in container via currentColor fill
const CheckIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 13.2 9.45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11.5356 0.285571C11.9163 -0.0951903 12.5337 -0.0951903 12.9145 0.285571C13.2952 0.666332 13.2952 1.28372 12.9145 1.66448L5.41448 9.16448C5.03372 9.54524 4.41633 9.54524 4.03557 9.16448L0.285571 5.41448C-0.0951903 5.03372 -0.0951903 4.41633 0.285571 4.03557C0.666332 3.65481 1.28372 3.65481 1.66448 4.03557L4.72502 7.09612L11.5356 0.285571Z"
      fill="currentColor"
    />
  </svg>
);

// Indeterminate icon — dash, currentColor fill
const MinusIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 13.95 1.95"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12.9746 0C13.5131 0 13.9492 0.436132 13.9492 0.974609C13.9492 1.51309 13.5131 1.94922 12.9746 1.94922H0.974609C0.436132 1.94922 0 1.51309 0 0.974609C0 0.436132 0.436132 0 0.974609 0H12.9746Z"
      fill="currentColor"
    />
  </svg>
);

const SIZE_CONFIG = {
  sm: { box: 'w-4 h-4', iconPadding: 'p-[3px]' },
  md: { box: 'w-5 h-5', iconPadding: 'p-[4px]' },
  lg: { box: 'w-6 h-6', iconPadding: 'p-[5px]' },
} as const;

const LABEL_CONFIG = {
  sm: 'text-xs leading-4',
  md: 'text-sm leading-5',
  lg: 'text-base leading-6',
} as const;

const DESCRIPTION_INDENT = {
  sm: 'pl-6',
  md: 'pl-7',
  lg: 'pl-8',
} as const;

/**
 * Checkbox — design system checkbox component.
 *
 * Figma: 63574:11664 (overview), 63574:11949 (light), 63574:13956 (dark)
 *
 * Variants:
 * - accent: brand purple fill when checked (--brand/base auto-switches light/dark)
 * - mono: black fill in light, white fill in dark (--blackinverse-a100)
 *
 * States: Default (opacity 1), Hovered (0.8), Pressed (0.7), Disabled (0.35)
 * Border unchecked: --blackinverse-a8 (2px, radius 2px)
 * Border error: --status-negative
 */
const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  className,
  disabled = false,
  error = false,
  indeterminate = false,
  size = 'md',
  variant = 'accent',
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const s = SIZE_CONFIG[size];

  const handleClick = () => {
    if (!disabled) onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const isCheckedOrIndeterminate = checked || indeterminate;

  // Background when checked/indeterminate
  const checkedBg =
    variant === 'accent' ? 'bg-brand-base' : 'bg-blackinverse-a100';

  // Icon color (white on accent, inverted on mono)
  const iconColor =
    variant === 'accent'
      ? 'text-texticon-fixed_white'
      : 'text-whiteinverse-a100';

  const boxClass = classNames(
    s.box,
    'rounded-[2px] flex-shrink-0 flex items-center justify-center transition-all duration-150',
    isCheckedOrIndeterminate
      ? [checkedBg, s.iconPadding, iconColor]
      : error
        ? 'border-2 border-status-negative'
        : 'border-2 border-blackinverse-a8'
  );

  return (
    <div className={classNames('flex flex-col', className)}>
      <div
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        data-testid={testId}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={classNames(
          'flex items-start gap-2 select-none',
          disabled
            ? 'opacity-[0.35] cursor-not-allowed'
            : 'cursor-pointer hover:opacity-80 active:opacity-70'
        )}
      >
        <div className={boxClass}>
          {checked && !indeterminate && <CheckIcon />}
          {indeterminate && <MinusIcon />}
        </div>
        {label && (
          <span
            className={classNames(LABEL_CONFIG[size], 'text-blackinverse-a100')}
          >
            {label}
          </span>
        )}
      </div>
      {description && (
        <div
          className={classNames(
            'text-sm text-blackinverse-a56 mt-1',
            DESCRIPTION_INDENT[size]
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
};

export default Checkbox;

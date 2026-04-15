'use client';

import classNames from 'classnames';
import React from 'react';

export type RadioButtonSize = 'sm' | 'md' | 'lg';
export type RadioButtonVariant = 'accent' | 'mono';

export interface RadioButtonProps {
  /** Whether this radio button is selected */
  checked: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
  /** Error state — red border */
  error?: boolean;
  /** sm = 16×16, md = 20×20, lg = 24×24. Default: 'md' */
  size?: RadioButtonSize;
  /** accent = brand purple (default), mono = black/white */
  variant?: RadioButtonVariant;
  'aria-label'?: string;
  'data-testid'?: string;
  tabIndex?: number;
}

/**
 * RadioButton — design system radio button component.
 *
 * Figma node: 63574:14519
 * Figma: 63574:14519 (overview), 63574:15664 (light), 63574:15999 (dark)
 *
 * Variants:
 * - accent: brand purple fill when checked (--brand-primary auto-switches light/dark)
 * - mono: black fill in light, white fill in dark (--blackinverse-a100)
 *
 * States: Default (opacity 1.0), Hovered (0.8), Pressed (0.7), Disabled (0.35)
 * Shape: fully circular (rounded-full)
 * Border unchecked: 2px --blackinverse-a8 (rgba(4,4,5,0.08) light / rgba(255,255,255,0.12) dark)
 * Border error: 2px --status-negative (#f25555)
 *
 * Inner mark (dot) sizes per Figma:
 * - sm: 8×8px, md: 10×10px, lg: 12×12px
 * Mark color:
 * - accent: bg-white (always #fff — Figma --brand/text-&-icon; --texticon-fixed_white not compiled by Tailwind)
 * - mono: --whiteinverse-a100 (white in light → visible on black; dark in dark → visible on white)
 */

const SIZE_CONFIG = {
  sm: { outer: 'w-4 h-4', mark: 'w-2 h-2' }, // 16px outer, 8px mark
  md: { outer: 'w-5 h-5', mark: 'w-2.5 h-2.5' }, // 20px outer, 10px mark
  lg: { outer: 'w-6 h-6', mark: 'w-3 h-3' }, // 24px outer, 12px mark
} as const;

const RadioButton: React.FC<RadioButtonProps> = ({
  checked,
  onChange,
  className,
  disabled = false,
  error = false,
  size = 'md',
  variant = 'accent',
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  tabIndex,
}) => {
  const s = SIZE_CONFIG[size];

  const handleClick = () => {
    if (!disabled && !checked) onChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && !checked) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange();
      }
    }
  };

  // Outer circle background when checked
  const checkedBg =
    variant === 'accent' ? 'bg-brand-base' : 'bg-blackinverse-a100';

  // Inner dot color
  // accent: always white per Figma (--brand/text-&-icon = #FFFFFF in both themes)
  // mono: --whiteinverse-a100 = white in light (visible on black bg), dark in dark (visible on white bg)
  const markColor =
    variant === 'accent' ? 'bg-texticon-fixed_white' : 'bg-whiteinverse-a100';

  const outerClass = classNames(
    s.outer,
    'rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-150',
    checked
      ? checkedBg
      : error
        ? 'border-2 border-status-negative'
        : 'border-2 border-blackinverse-a8'
  );

  return (
    <div
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={classNames(
        'inline-flex items-center justify-center select-none transition-opacity duration-150',
        disabled
          ? 'opacity-statedisabled cursor-not-allowed'
          : 'cursor-pointer hover:opacity-80 active:opacity-70',
        className
      )}
    >
      <div className={outerClass}>
        {checked && (
          <div
            className={classNames(
              'rounded-full flex-shrink-0',
              s.mark,
              markColor
            )}
          />
        )}
      </div>
    </div>
  );
};

export default RadioButton;

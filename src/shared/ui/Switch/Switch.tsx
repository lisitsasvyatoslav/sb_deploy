'use client';

import classNames from 'classnames';
import React from 'react';

export type SwitchSize = 'sm' | 'md';
export type SwitchVariant = 'accent' | 'mono';

export interface SwitchProps {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Native click handler — use to stop propagation when Switch is inside a clickable container */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Size: sm = 24x12px (web), md = 40x20px (app). Default: 'sm' */
  size?: SwitchSize;
  /** Visual style: accent = purple (default), mono = black/white. Default: 'accent' */
  variant?: SwitchVariant;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const SIZE_CONFIG = {
  sm: {
    track: 'w-6 h-3', // 24x12px
    thumb: 'w-3 h-2', // 12x8px
    thumbBg: 'bg-[var(--switch-thumb)]', // rgba(255,255,255,0.9) / rgba(28,28,31,0.92)
    thumbOffset: 'top-0.5 left-0.5', // 2px
    travel: 'translate-x-2', // 8px
    dot: 'w-[3px] h-[3px]', // 3x3px
  },
  md: {
    track: 'w-10 h-5', // 40x20px
    thumb: 'w-5 h-3', // 20x12px
    thumbBg: 'bg-white', // Figma: #FFFFFF (fully opaque)
    thumbOffset: 'top-1 left-1', // 4px
    travel: 'translate-x-3', // 12px
    dot: null, // no dot in App size per Figma
  },
} as const;

const VARIANT_CONFIG = {
  accent: {
    trackOn: 'bg-[var(--switch-bg-on)]',
    focusRing: 'focus-visible:ring-[var(--switch-bg-on)]',
    dot: 'bg-[var(--switch-dot)]',
  },
  mono: {
    trackOn: 'bg-blackinverse-a100',
    focusRing: 'focus-visible:ring-blackinverse-a100',
    dot: 'bg-blackinverse-a100',
  },
} as const;

const TRACK_STATES =
  'hover:opacity-80 active:opacity-70 disabled:opacity-35 disabled:cursor-not-allowed';

/**
 * Switch — Toggle switch component
 *
 * Figma node: 55058:4837 (Switch/Web), 2753:47119 (Switch/App)
 * Two sizes: sm (24x12px web) and md (40x20px app)
 * Uses CSS variables from manual-overrides.css: --switch-bg-off, --switch-bg-on, --switch-thumb, --switch-dot
 * Variants: accent (purple, default), mono (black/white)
 */
const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  onClick,
  size = 'sm',
  variant = 'accent',
  disabled = false,
  className,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const s = SIZE_CONFIG[size];
  const v = VARIANT_CONFIG[variant];

  return (
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onChange(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }
      }}
      data-testid={dataTestId}
      className={classNames(
        'relative inline-flex flex-shrink-0 rounded-[2px]',
        'transition-colors duration-150',
        `focus-visible:outline-none focus-visible:ring-2 ${v.focusRing} focus-visible:ring-offset-2`,
        TRACK_STATES,
        s.track,
        checked ? v.trackOn : 'bg-[var(--switch-bg-off)]',
        className
      )}
    >
      <span
        className={classNames(
          'absolute rounded-[1px]',
          'transition-transform duration-150',
          'flex items-center justify-center',
          s.thumb,
          s.thumbOffset,
          checked ? `${s.travel} ${s.thumbBg}` : `translate-x-0 ${s.thumbBg}`
        )}
      >
        {checked && s.dot && (
          <span className={classNames('rounded-full', v.dot, s.dot)} />
        )}
      </span>
    </button>
  );
};

export default Switch;

import classNames from 'classnames';
import React from 'react';

export type CounterSize = 'XL' | 'L' | 'M' | 'S';
export type CounterVariant = 'accent' | 'primary' | 'secondary' | 'white';

export interface CounterProps {
  /** Displayed value (number or string like "99+") */
  children: string | number;
  /** Size variant. Default: 'M' */
  size?: CounterSize;
  /** Visual variant. Default: 'primary' */
  variant?: CounterVariant;
  /** Additional CSS classes */
  className?: string;
}

const SIZE_CONFIG = {
  XL: {
    box: 'min-h-base-20 min-w-base-20',
    padding: 'px-spacing-6',
    radius: 'rounded-radius-12',
    text: 'text-12 font-semibold leading-16',
  },
  L: {
    box: 'min-h-base-16 min-w-base-16',
    padding: 'px-spacing-4',
    radius: 'rounded-radius-8',
    text: 'text-12 font-medium leading-16',
  },
  M: {
    box: 'min-h-base-14 min-w-base-14',
    // 3px — no spacing-3 token; TODO: add if Figma exports it
    padding: 'px-[3px]',
    radius: 'rounded-radius-8',
    // 9px font size — no text-9 token (scale: text-8, text-10); TODO: add if confirmed in tokens
    text: 'text-[9px] font-medium leading-12',
  },
  S: {
    box: 'min-h-base-12 min-w-base-12',
    padding: 'px-spacing-2',
    radius: 'rounded-radius-6',
    text: 'text-[9px] font-medium leading-12',
  },
} as const;

const VARIANT_CONFIG = {
  accent: {
    bg: 'bg-brand-base',
    text: 'text-brand-text___icon',
    extra: undefined,
  },
  primary: {
    bg: 'bg-blackinverse-a100',
    text: 'text-whiteinverse-a100',
    extra: undefined,
  },
  secondary: {
    bg: 'bg-blackinverse-a12',
    text: 'text-blackinverse-a100',
    extra: 'backdrop-blur-extra',
  },
  white: {
    bg: 'bg-whiteinverse-a100',
    text: 'text-blackinverse-a100',
    extra: undefined,
  },
} as const;

/**
 * Counter — small numeric badge/pill.
 *
 * Figma node: 55586:4551
 * Variants: accent, primary, secondary, white
 * Sizes: XL (20px), L (16px), M (14px), S (12px)
 */
const Counter: React.FC<CounterProps> = ({
  children,
  size = 'M',
  variant = 'primary',
  className,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  return (
    <span
      className={classNames(
        'inline-flex items-center justify-center',
        '[font-feature-settings:"lnum","tnum"]',
        'whitespace-nowrap',
        sizeConfig.box,
        sizeConfig.padding,
        sizeConfig.radius,
        sizeConfig.text,
        variantConfig.bg,
        variantConfig.text,
        variantConfig.extra,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Counter;

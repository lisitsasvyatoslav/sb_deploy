import React from 'react';
import Counter, { type CounterSize } from '@/shared/ui/Counter';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import { cn } from '@/shared/utils/cn';

export type IconButtonSizeAlias = 'xs' | 'sm' | 'md';
export type IconButtonSizeNumber = 16 | 20 | 24 | 32 | 40;
export type IconButtonSize = IconButtonSizeAlias | IconButtonSizeNumber;
export type IconButtonState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'focused'
  | 'disabled';
export type IconButtonVariant = 'default' | 'negative';

const SIZE_ALIAS_MAP: Record<IconButtonSizeAlias, IconButtonSizeNumber> = {
  xs: 16,
  sm: 20,
  md: 24,
};

export interface IconButtonProps {
  /** Icon (React element, SVG, or IconVariant string name) */
  icon: React.ReactNode | IconVariant;
  /** Button size. Figma: xs=16, sm=20, md=24. App extensions: 32, 40. Default: 'md' (24px) */
  size?: IconButtonSize;
  /** Visual variant. Default: 'default' */
  variant?: IconButtonVariant;
  /** Visual state (usually controlled automatically through CSS) */
  state?: IconButtonState;
  /** Disabled state */
  disabled?: boolean;
  /** Active/selected toggle state — icon turns brand-base colour */
  isActive?: boolean;
  /** Counter badge value */
  counterValue?: number;
  /** Show dot notification indicator */
  showDot?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

const ICON_SIZE_CONFIG: Record<
  IconButtonSizeNumber,
  {
    icon: string;
    counterSize: CounterSize;
    dot: string;
  }
> = {
  16: {
    icon: 'w-spacing-16 h-spacing-16',
    counterSize: 'S',
    dot: 'w-spacing-6 h-spacing-6',
  },
  20: {
    icon: 'w-spacing-20 h-spacing-20',
    counterSize: 'S',
    dot: 'w-spacing-8 h-spacing-8',
  },
  24: {
    icon: 'w-spacing-24 h-spacing-24',
    counterSize: 'M',
    dot: 'w-spacing-8 h-spacing-8',
  },
  32: {
    icon: 'w-spacing-32 h-spacing-32',
    counterSize: 'M',
    dot: 'w-spacing-8 h-spacing-8',
  },
  40: {
    icon: 'w-spacing-40 h-spacing-40',
    counterSize: 'M',
    dot: 'w-spacing-8 h-spacing-8',
  },
} as const;

const VARIANT_STATES: Record<
  IconButtonVariant,
  { base: string; active: string; interactive: string; focusRing: string }
> = {
  default: {
    base: 'text-blackinverse-a56',
    active: 'text-brand-base',
    interactive:
      'hover:text-blackinverse-a100 active:text-blackinverse-a100 active:opacity-statefocused',
    focusRing:
      'focus-visible:ring-2 focus-visible:ring-mind-accent focus-visible:ring-offset-2 focus-visible:outline-none',
  },
  negative: {
    base: 'text-blackinverse-a56',
    active: 'text-brand-base',
    interactive:
      'hover:text-status-negative active:text-status-negative active:opacity-statefocused',
    focusRing:
      'focus-visible:ring-2 focus-visible:ring-status-negative focus-visible:ring-offset-2 focus-visible:outline-none',
  },
} as const;

const EXPLICIT_STATE_CLASSES: Record<
  IconButtonVariant,
  Record<IconButtonState, string>
> = {
  default: {
    default: 'text-blackinverse-a56',
    hover: 'text-blackinverse-a100',
    pressed: 'text-blackinverse-a100 opacity-statefocused',
    focused: 'text-mind-accent',
    disabled:
      'text-blackinverse-a56 opacity-statedisabled cursor-not-allowed pointer-events-none',
  },
  negative: {
    default: 'text-blackinverse-a56',
    hover: 'text-status-negative',
    pressed: 'text-status-negative opacity-statefocused',
    focused: 'text-status-negative',
    disabled:
      'text-blackinverse-a56 opacity-statedisabled cursor-not-allowed pointer-events-none',
  },
};

/**
 * IconButton — icon-only button with badge support.
 *
 * Figma node: 55350:5722 (default), 60509:3342 (negative)
 * Sizes: Xs (16px), Sm (20px), Md (24px) — sizes 32/40 are app extensions.
 * Variants: default, negative
 * Badges: counter (number), dot (notification indicator)
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size: sizeProp = 'md',
  variant = 'default',
  state,
  disabled = false,
  isActive = false,
  counterValue,
  showDot = false,
  onClick,
  className,
  ariaLabel,
  type = 'button',
  'data-testid': dataTestId,
}) => {
  const resolvedSize: IconButtonSizeNumber =
    typeof sizeProp === 'string' ? SIZE_ALIAS_MAP[sizeProp] : sizeProp;
  const sizeConfig = ICON_SIZE_CONFIG[resolvedSize];
  const variantConfig = VARIANT_STATES[variant];
  const showCounter =
    counterValue !== undefined && counterValue > 0 && !showDot;
  const isDisabled = disabled || state === 'disabled';

  const buttonClasses = cn(
    'relative inline-flex items-center justify-center',
    'transition-all duration-200',
    isDisabled
      ? 'text-blackinverse-a56 opacity-statedisabled cursor-not-allowed pointer-events-none'
      : state
        ? EXPLICIT_STATE_CLASSES[variant][state]
        : cn(
            isActive ? variantConfig.active : variantConfig.base,
            variantConfig.interactive,
            variantConfig.focusRing
          ),
    className
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      aria-label={ariaLabel}
      aria-pressed={isActive || undefined}
      data-testid={dataTestId}
    >
      <span className={cn('flex items-center justify-center', sizeConfig.icon)}>
        {typeof icon === 'string' ? (
          <Icon variant={icon as IconVariant} size={resolvedSize} />
        ) : (
          icon
        )}
      </span>

      {showCounter && (
        // TODO: replace with spacing tokens when available (Figma badge offset: -4px top, -1.5px right)
        <Counter
          className="absolute top-[-4px] right-[-1.5px]"
          size={sizeConfig.counterSize}
          variant="accent"
        >
          {counterValue > 99 ? '99+' : String(counterValue)}
        </Counter>
      )}

      {showDot && (
        <span
          className={cn(
            'absolute top-spacing-0 right-spacing-0 bg-mind-accent rounded-full',
            sizeConfig.dot
          )}
        />
      )}
    </button>
  );
};

export default IconButton;

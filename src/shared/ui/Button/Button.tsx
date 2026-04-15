import CircularProgress from '@mui/material/CircularProgress';
import { cn } from '@/shared/utils/cn';
import React from 'react';
import { Icon } from '@/shared/ui/Icon';
import { ButtonIcon, ButtonProps } from './Button.types';

const SIZE_CONFIG = {
  xl: {
    height: 'h-spacing-56', // 56px
    fontSize: 'text-18', // 18px
    lineHeight: 'leading-24', // 24px
    fontWeight: 'font-semibold', // 600
    letterSpacing: 'tracking-tight-2', // -0.4px
    padding: 'py-spacing-16 px-spacing-20',
    iconOnlyPadding: 'p-spacing-16',
    gap: 'gap-spacing-8',
    iconSize: 'w-spacing-24 h-spacing-24',
    textPadding: 'px-spacing-4',
    width: 'w-spacing-56',
  },
  lg: {
    height: 'h-spacing-48', // 48px
    fontSize: 'text-16', // 16px
    lineHeight: 'leading-24', // 24px
    fontWeight: 'font-semibold',
    letterSpacing: 'tracking-tight-2', // -0.4px
    padding: 'py-spacing-12 px-spacing-16',
    iconOnlyPadding: 'p-spacing-12',
    gap: 'gap-spacing-8',
    iconSize: 'w-spacing-24 h-spacing-24',
    textPadding: 'px-spacing-4',
    width: 'w-spacing-48',
  },
  md: {
    height: 'h-spacing-40', // 40px
    fontSize: 'text-14', // 14px
    lineHeight: 'leading-20', // 20px
    fontWeight: 'font-semibold',
    letterSpacing: 'tracking-tight-1', // -0.2px
    padding: 'py-spacing-10 px-spacing-14',
    iconOnlyPadding: 'p-spacing-10',
    gap: 'gap-spacing-6',
    iconSize: 'w-spacing-20 h-spacing-20',
    textPadding: 'px-spacing-2',
    width: 'w-spacing-40',
  },
  sm: {
    height: 'h-spacing-32', // 32px
    fontSize: 'text-12', // 12px
    lineHeight: 'leading-16', // 16px
    fontWeight: 'font-medium', // 500
    letterSpacing: 'tracking-tight-1',
    padding: 'py-spacing-8 px-spacing-12',
    iconOnlyPadding: 'p-spacing-8',
    gap: 'gap-spacing-4',
    iconSize: 'w-spacing-16 h-spacing-16',
    textPadding: 'px-spacing-2',
    width: 'w-spacing-32',
  },
  xs: {
    height: 'h-spacing-24', // 24px
    fontSize: 'text-12', // 12px
    lineHeight: 'leading-16', // 16px
    fontWeight: 'font-medium',
    letterSpacing: 'tracking-tight-1',
    padding: 'py-spacing-4 px-spacing-6',
    iconOnlyPadding: 'p-spacing-4',
    gap: 'gap-spacing-2',
    iconSize: 'w-spacing-16 h-spacing-16',
    textPadding: 'px-spacing-2',
    width: 'w-spacing-24',
  },
} as const;

const SPINNER_SIZES = {
  xl: 24,
  lg: 24,
  md: 20,
  sm: 16,
  xs: 14,
} as const;

const COMMON_STATES =
  'opacity-100 hover:opacity-80 active:opacity-70 disabled:opacity-35';
const COMMON_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const VARIANT_CONFIG = {
  accent: {
    bg: 'bg-mind-accent',
    text: 'text-white',
    states: COMMON_STATES,
    focus: `${COMMON_FOCUS} focus-visible:ring-mind-accent`,
    blur: 'backdrop-blur-medium',
  },
  primary: {
    bg: 'bg-blackinverse-a88',
    text: 'text-whiteinverse-a100',
    states: COMMON_STATES,
    focus: `${COMMON_FOCUS} focus-visible:ring-mind-accent`,
    blur: 'backdrop-blur-medium',
  },
  negative: {
    bg: 'bg-status-negative',
    text: 'text-white',
    states: COMMON_STATES,
    focus: `${COMMON_FOCUS} focus-visible:ring-status-negative`,
    blur: 'backdrop-blur-medium',
  },
  secondary: {
    bg: 'bg-blackinverse-a8',
    text: 'text-blackinverse-a100',
    states: COMMON_STATES,
    focus: `${COMMON_FOCUS} focus-visible:ring-mind-accent`,
    blur: 'backdrop-blur-extra',
  },
  ghost: {
    bg: 'bg-blackinverse-a0',
    text: 'text-blackinverse-a56',
    states:
      'opacity-100 disabled:opacity-35 hover:text-blackinverse-a100 active:opacity-80 active:text-blackinverse-a100',
    focus: `${COMMON_FOCUS} focus-visible:ring-mind-accent`,
    blur: 'backdrop-blur-none',
  },
} as const;

function resolveIcon(value: ButtonIcon | undefined): React.ReactNode {
  if (!value) return null;
  if (typeof value === 'string') return <Icon variant={value} />;
  return value;
}

type ButtonLayout =
  | 'icon-only'
  | 'icon-left'
  | 'icon-right'
  | 'icon-both'
  | 'text-only';

function getLayout(
  icon: React.ReactNode,
  iconRight: React.ReactNode,
  children: React.ReactNode,
  iconSide?: ButtonProps['iconSide']
): ButtonLayout {
  if (icon && !children && !iconRight) return 'icon-only';
  if (icon && iconRight) return 'icon-both';
  if (icon && iconSide === 'right') return 'icon-right';
  if (icon) return 'icon-left';
  if (iconRight) return 'icon-right';
  return 'text-only';
}

/**
 * Universal Button component from Figma Design System
 *
 * Figma node: 55087:5325
 *
 * @important Pass icons WITHOUT size prop - component controls size via Tailwind:
 *   icon={<PlusIcon />}
 *
 * @important For icon-only buttons, always provide aria-label:
 *   <Button icon={<PlusIcon />} aria-label="Add item" />
 */
const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      size = 'md',
      variant = 'accent',
      fullWidth = false,
      iconSide,
      icon,
      iconRight,
      loading = false,
      type = 'button',
      className,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      children,
      href,
      target,
      rel,
      ...rest
    },
    ref
  ) => {
    const resolvedIcon = resolveIcon(icon);
    const resolvedIconRight = resolveIcon(iconRight);

    const layout = getLayout(
      resolvedIcon,
      resolvedIconRight,
      children,
      iconSide
    );
    const isIconOnly = layout === 'icon-only';

    const sizeConfig = SIZE_CONFIG[size];
    const variantConfig = VARIANT_CONFIG[variant];

    const buttonClasses = cn(
      fullWidth ? 'flex w-full' : 'inline-flex',
      'items-center justify-center whitespace-nowrap rounded-radius-2 transition-all duration-200',
      'border-none cursor-pointer relative disabled:cursor-not-allowed',
      sizeConfig.height,
      sizeConfig.fontSize,
      sizeConfig.lineHeight,
      sizeConfig.fontWeight,
      sizeConfig.letterSpacing,
      isIconOnly ? sizeConfig.iconOnlyPadding : sizeConfig.padding,
      isIconOnly && sizeConfig.width,
      variantConfig.bg,
      variantConfig.text,
      variantConfig.states,
      variantConfig.focus,
      variantConfig.blur,
      loading && '[&>span:first-child]:opacity-0',
      className
    );

    const iconClasses = cn(
      'inline-flex items-center justify-center flex-shrink-0',
      sizeConfig.iconSize,
      '[&>svg]:block [&>svg]:w-full [&>svg]:h-full'
    );

    const iconLeftSpan = resolvedIcon ? (
      <span className={iconClasses}>{resolvedIcon}</span>
    ) : null;
    const iconRightSpan = resolvedIconRight ? (
      <span className={iconClasses}>{resolvedIconRight}</span>
    ) : null;

    const content = (
      <>
        <span
          className={cn(
            'inline-flex items-center justify-center',
            sizeConfig.gap
          )}
        >
          {(layout === 'icon-left' ||
            layout === 'icon-only' ||
            layout === 'icon-both') &&
            iconLeftSpan}
          {children && (
            <span className={sizeConfig.textPadding}>{children}</span>
          )}
          {layout === 'icon-right' && (iconRightSpan ?? iconLeftSpan)}
          {layout === 'icon-both' && iconRightSpan}
        </span>
        {loading && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center [&>svg]:text-inherit">
            <CircularProgress size={SPINNER_SIZES[size]} color="inherit" />
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={buttonClasses}
          data-testid={dataTestId}
          data-variant={variant}
          aria-label={isIconOnly ? ariaLabel : undefined}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={buttonClasses}
        data-testid={dataTestId}
        data-variant={variant}
        aria-label={isIconOnly ? ariaLabel : undefined}
        aria-busy={loading}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

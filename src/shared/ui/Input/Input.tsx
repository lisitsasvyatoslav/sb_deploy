import React from 'react';
import classNames from 'classnames';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import BaseImage from '@/shared/ui/BaseImage';

export type InputSize = 'lg' | 'md' | 'sm';
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

/** IconVariant string or arbitrary ReactNode (e.g. avatar) */
export type InputIcon = IconVariant | React.ReactNode;

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Input size (lg = 48px, md = 40px, sm = 32px) */
  size?: InputSize;
  /** Input type */
  type?: InputType;
  /** Label for the input */
  label?: string;
  /** Hint text */
  hint?: string;
  /** Error message */
  error?: string;
  /** Avatar URL (20×20 circle, rendered before leftIcon) — Figma: IMG */
  imgSrc?: string;
  /** Avatar load error behavior: 'placeholder' — grey circle (default), 'hide' — hide element */
  imgErrorBehavior?: 'placeholder' | 'hide';
  /** Left icon — IconVariant string or ReactNode */
  leftIcon?: InputIcon;
  /** Right icon — IconVariant string or ReactNode */
  rightIcon?: InputIcon;
  /** Additional class for the container */
  containerClassName?: string;
}

/* ─── Size config (Figma: inputLg / inputMd / inputSm) ─── */

const SIZE_CONFIG = {
  lg: {
    surface: 'h-spacing-48 gap-spacing-8', // 48px
    paddingY: 'py-spacing-14',
    paddingX: 'px-spacing-12',
    paddingXWithIcon: 'px-spacing-12',
    text: 'text-14 leading-20 tracking-tight-1',
    iconSize: 20,
  },
  md: {
    surface: 'h-spacing-40 gap-spacing-8', // 40px
    paddingY: 'py-spacing-10',
    paddingX: 'px-spacing-12',
    paddingXWithIcon: 'px-spacing-12',
    text: 'text-14 leading-20 tracking-tight-1',
    iconSize: 20,
  },
  sm: {
    surface: 'h-spacing-32 gap-spacing-8', // 32px
    paddingY: 'py-spacing-6',
    paddingX: 'px-spacing-8',
    paddingXWithIcon: 'px-spacing-8',
    text: 'text-14 leading-20 tracking-tight-1',
    iconSize: 20,
  },
} as const;

/*
 * ─── State styles ──────────────────────────────────────────────────
 *
 * Figma states: Default, Hovered, Focused, Typing, Entered,
 *               Entered+Hovered, Error, Error+Hovered,
 *               Error Focused, Disabled
 *
 * CSS mapping:
 *   Hovered        → group-hover/input:*
 *   Focused/Typing → group-focus-within/input:*
 *   Error          → error prop (JS ternary via s() helper)
 *   Disabled       → disabled prop
 * ───────────────────────────────────────────────────────────────────
 */

const STATE = {
  // Surface
  surfaceBg: {
    normal: 'bg-wrapper-a6',
    error: 'bg-colors-status_negative_bg',
  },
  surfaceHover: 'group-hover/input:opacity-80',

  // Left icon
  leftIcon: {
    normal: 'text-blackinverse-a56',
    error: 'text-status-negative',
  },
  leftIconFocus: {
    normal: 'group-focus-within/input:text-blackinverse-a100',
    error: '',
  },

  // Right icon
  rightIcon: 'text-blackinverse-a56',

  // Input text
  inputText: 'text-blackinverse-a100',
  inputPlaceholder: 'placeholder:text-blackinverse-a56',

  // Focus line (2px at bottom, visible only on focus)
  focusLine: {
    normal: 'bg-brand-base',
    error: 'bg-status-negative',
  },

  // Label
  label: {
    normal: 'text-blackinverse-a100',
    disabled: 'text-blackinverse-a56',
  },

  // Hint / error text
  hintText: {
    normal: 'text-blackinverse-a56',
    error: 'text-status-negative',
  },

  // Disabled (applied on wrapper)
  disabled: 'opacity-35 cursor-not-allowed',
} as const;

/* ─── Helpers ─── */

/** If a string is passed — render Icon, otherwise ReactNode as-is */
function renderIcon(icon: InputIcon, size: number): React.ReactNode {
  return typeof icon === 'string' ? (
    <Icon variant={icon as IconVariant} size={size} />
  ) : (
    icon
  );
}

/**
 * Input — Figma inputLg / inputMd / inputSm
 *
 * Figma node: 55784:5958
 */
const Input: React.FC<InputProps & { ref?: React.Ref<HTMLInputElement> }> = ({
  size = 'md',
  type = 'text',
  label,
  hint,
  error,
  imgSrc,
  imgErrorBehavior = 'placeholder',
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  disabled = false,
  id,
  ref,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const [imgHidden, setImgHidden] = React.useState(false);

  React.useEffect(() => {
    setImgHidden(false);
  }, [imgSrc]);

  const config = SIZE_CONFIG[size];
  const hasImg = !!imgSrc && !imgHidden;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  /** Picks normal/error style */
  const s = (pair: { normal: string; error: string }) =>
    error ? pair.error : pair.normal;

  return (
    <div
      className={classNames(
        'group/input flex flex-col',
        disabled && STATE.disabled,
        containerClassName
      )}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={classNames(
            'text-12 leading-16 tracking-tight-1 font-normal mb-spacing-4',
            disabled ? STATE.label.disabled : STATE.label.normal
          )}
        >
          {label}
        </label>
      )}

      <div
        className={classNames(
          'group relative flex items-center rounded-radius-2 overflow-hidden',
          config.surface,
          config.paddingY,
          hasImg || hasLeftIcon || hasRightIcon
            ? config.paddingXWithIcon
            : config.paddingX,
          s(STATE.surfaceBg),
          !disabled && STATE.surfaceHover,
          'transition-opacity duration-150'
        )}
      >
        {hasImg && (
          <span className="flex-shrink-0 size-5 rounded-full bg-blackinverse-a6 overflow-hidden pointer-events-none">
            <BaseImage
              src={imgSrc!}
              alt=""
              onError={() => {
                if (imgErrorBehavior === 'hide') setImgHidden(true);
              }}
              className="size-full rounded-full object-cover"
            />
          </span>
        )}

        {leftIcon && (
          <span
            className={classNames(
              'flex-shrink-0 flex items-center gap-spacing-8',
              'pointer-events-none transition-colors duration-150',
              s(STATE.leftIcon),
              s(STATE.leftIconFocus)
            )}
          >
            {renderIcon(leftIcon, config.iconSize)}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={classNames(
            'flex-1 min-w-0 bg-transparent border-none outline-none p-0',
            STATE.inputText,
            STATE.inputPlaceholder,
            'disabled:cursor-not-allowed',
            config.text,
            className
          )}
          {...props}
        />

        {rightIcon && (
          <span
            className={classNames(
              'flex-shrink-0 flex items-center gap-spacing-8',
              STATE.rightIcon
            )}
          >
            {renderIcon(rightIcon, config.iconSize)}
          </span>
        )}

        {/* Focus/Error line — 2px absolute at bottom, only visible on focus */}
        <div
          className={classNames(
            'absolute bottom-0 left-0 right-0 h-spacing-2',
            'transition-opacity duration-150',
            'opacity-0 group-focus-within/input:opacity-100',
            s(STATE.focusLine)
          )}
        />
      </div>

      {(hint || error) && (
        <p
          className={classNames(
            'text-12 leading-16 tracking-tight-1 font-normal mt-spacing-6',
            s(STATE.hintText)
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default Input;

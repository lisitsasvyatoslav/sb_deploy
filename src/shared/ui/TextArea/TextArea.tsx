'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';

export interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> {
  /** Label above the textarea */
  label?: string;
  /** Hint text below (left side) */
  hint?: string;
  /** Error message — replaces hint, switches to error styling */
  error?: string;
  /** Show character counter (requires maxLength). Defaults to true when maxLength is set */
  showCounter?: boolean;
  /** Additional class for the outer container div */
  containerClassName?: string;
  /** Additional class(es) for the hint/error text element */
  hintClassName?: string;
}

/* ─── State styles ──────────────────────────────────────────────────
 *
 * Figma states: Default, Hovered, Focused, Entered,
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
  surfaceBg: {
    normal: 'bg-wrapper-a6',
    error: 'bg-colors-status_negative_bg',
  },
  surfaceHover: 'group-hover/input:opacity-80',

  inputText: 'text-blackinverse-a100',
  inputPlaceholder: 'placeholder:text-blackinverse-a56',

  focusLine: {
    normal: 'bg-brand-base',
    error: 'bg-status-negative',
  },

  label: {
    normal: 'text-blackinverse-a100',
    disabled: 'text-blackinverse-a56',
  },

  hintText: {
    normal: 'text-blackinverse-a56',
    error: 'text-status-negative',
  },

  counterText: {
    normal: 'text-blackinverse-a56',
    error: 'text-status-negative',
  },

  disabled: 'opacity-35 cursor-not-allowed',
} as const;

/**
 * TextArea — Figma textArea
 *
 * Figma node: 55088:5328
 */
const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      hint,
      error,
      maxLength,
      showCounter,
      className,
      containerClassName,
      hintClassName,
      disabled = false,
      id,
      rows = 3,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hintId = `${textareaId}-hint`;

    const displayCounter = showCounter ?? maxLength != null;

    const [charCount, setCharCount] = React.useState(() => {
      if (value != null) return String(value).length;
      if (defaultValue != null) return String(defaultValue).length;
      return 0;
    });

    React.useEffect(() => {
      if (value != null) {
        setCharCount(String(value).length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value == null) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    /** Picks normal/error style */
    const s = (pair: { normal: string; error: string }) =>
      error ? pair.error : pair.normal;

    const hasDown = hint || error || displayCounter;

    return (
      <div
        className={cn(
          'group/input flex flex-col',
          disabled && STATE.disabled,
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'text-12 leading-16 tracking-tight-1 font-normal mb-spacing-4',
              disabled ? STATE.label.disabled : STATE.label.normal
            )}
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex rounded-radius-2 overflow-hidden',
            'py-spacing-10 px-spacing-12',
            s(STATE.surfaceBg),
            !disabled && STATE.surfaceHover,
            'transition-opacity duration-150'
          )}
        >
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-describedby={hasDown ? hintId : undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              'flex-1 min-w-0 bg-transparent border-none outline-none p-0 resize-none',
              STATE.inputText,
              STATE.inputPlaceholder,
              'disabled:cursor-not-allowed',
              'text-14 leading-20 tracking-tight-1 font-normal',
              className
            )}
            data-testid="textarea"
            {...props}
          />

          {/* Focus/Error line — 2px absolute at bottom, only visible on focus */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 h-spacing-2',
              'transition-opacity duration-150',
              'opacity-0 group-focus-within/input:opacity-100',
              s(STATE.focusLine)
            )}
          />
        </div>

        {hasDown && (
          <div id={hintId} className="flex gap-spacing-4 mt-spacing-4">
            {(hint || error) && (
              <p
                className={cn(
                  'flex-1 text-12 leading-16 tracking-tight-1 font-normal',
                  s(STATE.hintText),
                  hintClassName
                )}
              >
                {error || hint}
              </p>
            )}

            {displayCounter && maxLength != null && (
              <div
                className={cn(
                  'flex-shrink-0 flex items-center',
                  (hint || error) && 'border-l border-stroke-a8 pl-spacing-8'
                )}
              >
                <span
                  className={cn(
                    'text-12 leading-16 tracking-tight-1 font-normal',
                    s(STATE.counterText)
                  )}
                >
                  {charCount}/{maxLength}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

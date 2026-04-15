import classNames from 'classnames';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Icon } from '@/shared/ui/Icon/Icon';
import type { EditableTitleConfig } from '@/shared/ui/Modal/Modal.types';
import { isLightColor } from '@/shared/utils/colorUtils';

/* ───────── Color helpers ───────── */

/** Theme-aware text/bg using CSS variables that auto-switch in dark mode */
const TEXT_LIGHT = 'var(--whiteinverse-a100)';
const BG_CONTRAST = 'var(--wrapper-a100)';

/** Near-black (#040405) needs theme-aware bg instead of raw hex */
const CONTRAST_COLOR = '#040405';

/** Resolve label color properties for both static and editable variants */
function useLabelColors(labelColor?: string) {
  const hasColor = !!labelColor;
  const normalized = labelColor?.trim().toLowerCase();
  const isContrast = hasColor && normalized === CONTRAST_COLOR;
  const lightBg = isLightColor(labelColor);

  const resolvedBg = isContrast ? BG_CONTRAST : labelColor;
  const textColor = !hasColor
    ? 'var(--blackinverse-a100)'
    : isContrast
      ? TEXT_LIGHT
      : lightBg
        ? '#040405'
        : 'white';

  return { hasColor, isContrast, lightBg, resolvedBg, textColor };
}

/* ───────── InputBadge (static / display-only) ───────── */

export interface InputBadgeProps {
  /** Label text */
  label?: string;
  /** Label background color (CSS hex) */
  labelColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * InputBadge — static badge matching Figma inputBadge component in default state.
 *
 * Display-only label without hover/active states, edit icon, or input functionality.
 */
export function InputBadge({
  label,
  labelColor,
  className: extraClassName,
}: InputBadgeProps) {
  const { hasColor, resolvedBg, textColor } = useLabelColors(labelColor);

  if (!label) return null;

  return (
    <div
      className={classNames(
        'flex gap-0 items-center max-w-full px-[6px] py-[2px] rounded-[2px]',
        extraClassName
      )}
      style={{
        backgroundColor: hasColor ? resolvedBg : undefined,
      }}
    >
      <p
        className="min-w-0 text-[14px] font-normal leading-[20px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ color: textColor }}
      >
        {label}
      </p>
    </div>
  );
}

/* ───────── InputBadgeEditable ───────── */

export interface InputBadgeEditableProps {
  /** Editable label configuration */
  config: EditableTitleConfig;
  /** Color picker widget rendered next to the badge */
  colorWidget?: ReactNode;
}

/**
 * InputBadgeEditable — inline-editable badge matching Figma inputBadge component.
 *
 * States:
 * - Default: colored bg, text only
 * - Hover:   colored bg, opacity 0.8, editMicro icon appears
 * - Pressed: colored bg, opacity 0.7, editMicro icon appears
 * - Typing:  bg-background-white_medium, border 2px solid [color],
 *            text blackinverse-a100, tickMicro confirm button
 */
export function InputBadgeEditable({
  config,
  colorWidget,
}: InputBadgeEditableProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const valueOnFocusRef = useRef(config.value);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (config.focusTrigger) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [config.focusTrigger]);

  const { hasColor, isContrast, lightBg, resolvedBg, textColor } =
    useLabelColors(config.color);

  const handleConfirm = () => {
    confirmedRef.current = true;
    config.onConfirm?.();
    inputRef.current?.blur();
  };

  /* Figma: Typing border color
   * - Color: the color itself (e.g. blue, red)
   * - Contrast: stroke/a72 (rgba(4,4,5,0.72))
   * - Empty: stroke/a8 (rgba(4,4,5,0.08)) */
  const typingBorderColor = !hasColor
    ? 'var(--stroke-a8)'
    : isContrast
      ? 'var(--stroke-a72)'
      : resolvedBg;

  /* Figma: Typing bg — colored/contrast → background/white/medium, empty → transparent */
  const typingBg = hasColor ? 'var(--background-white_medium)' : undefined;

  return (
    <div className="group/label flex items-center gap-[4px] max-w-full min-w-0">
      {/* Badge container — inputBadge from Figma DS */}
      {/* nodrag: prevents React Flow from intercepting clicks for board drag */}
      <div
        className={classNames(
          'group/badge nodrag relative flex items-center rounded-[2px] min-w-0 cursor-text',
          isFocused
            ? 'border-[2px] border-solid gap-[2px] pl-[6px] pr-[4px] py-[2px]'
            : 'gap-0 px-[6px] py-[2px] hover:gap-[2px] hover:pl-[6px] hover:pr-[4px] hover:opacity-[0.8] active:gap-[2px] active:pl-[6px] active:pr-[4px] active:opacity-[0.7]'
        )}
        style={{
          backgroundColor: isFocused
            ? typingBg
            : hasColor
              ? resolvedBg
              : undefined,
          borderColor: isFocused ? typingBorderColor : undefined,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Input — Figma: text is shrink-0, fits content */}
        <input
          ref={inputRef}
          type="text"
          value={config.value}
          onChange={(e) => config.onChange?.(e.target.value)}
          onFocus={() => {
            valueOnFocusRef.current = config.value;
            confirmedRef.current = false;
            setIsFocused(true);
          }}
          onBlur={() => {
            if (
              !confirmedRef.current &&
              config.value !== valueOnFocusRef.current
            ) {
              config.onChange?.(valueOnFocusRef.current);
            }
            confirmedRef.current = false;
            setIsFocused(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleConfirm();
            }
            if (e.key === 'Escape') {
              if (config.value !== valueOnFocusRef.current) {
                e.stopPropagation();
                config.onChange?.(valueOnFocusRef.current);
              }
              inputRef.current?.blur();
            }
          }}
          placeholder={config.placeholder}
          className="min-w-0 [field-sizing:content] bg-transparent border-none outline-none text-[14px] font-normal leading-[20px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            color: isFocused ? 'var(--blackinverse-a100)' : textColor,
            caretColor: isFocused ? 'var(--blackinverse-a100)' : textColor,
          }}
        />

        {/* editMicro icon — Figma: overflow-clip shrink-0 size-16, visible on hover/pressed */}
        {!isFocused && config.onChange && (
          <button
            type="button"
            className="shrink-0 hidden group-hover/badge:block group-active/badge:block overflow-clip size-[16px] p-0 border-none bg-transparent cursor-pointer"
            aria-label="Edit"
            onMouseDown={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <Icon
              variant="editMicro"
              size={16}
              className={
                !hasColor
                  ? 'text-blackinverse-a100'
                  : lightBg
                    ? 'text-[#040405]'
                    : 'text-white'
              }
            />
          </button>
        )}

        {/* tickMicro confirm — Figma: 16×16 container, 20×20 icon centered absolute */}
        {isFocused && (
          <button
            type="button"
            className="shrink-0 relative size-[16px] p-0 border-none bg-transparent cursor-pointer"
            aria-label="Confirm"
            onMouseDown={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <Icon
              variant="tickMicro"
              size={20}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blackinverse-a56 hover:text-blackinverse-a100"
            />
          </button>
        )}
      </div>

      {/* Color picker widget — always visible */}
      {colorWidget && <div className="shrink-0 nodrag">{colorWidget}</div>}
    </div>
  );
}

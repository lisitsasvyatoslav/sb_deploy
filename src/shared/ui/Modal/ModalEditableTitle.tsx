'use client';

import { useRef, useState } from 'react';
import Check from '@mui/icons-material/Check';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { isLightColor } from '@/shared/utils/colorUtils';
import type { EditableTitleConfig } from './Modal.types';

const FALLBACK_TITLE_COLOR = 'var(--color-accent)';
const LIGHT_TEXT_ON_COLOR = 'var(--blackinverse-a100)';
const DARK_TEXT_ON_COLOR = 'var(--whiteinverse-a100)';

export function ModalEditableTitle({
  value,
  onChange,
  onConfirm,
  placeholder,
  color,
}: EditableTitleConfig) {
  const { t } = useTranslation('common');
  const resolvedPlaceholder = placeholder ?? t('modal.untitled');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const valueOnFocusRef = useRef(value);
  const confirmedRef = useRef(false);
  const titleColor = color || FALLBACK_TITLE_COLOR;
  const titleTextColor = isLightColor(titleColor)
    ? LIGHT_TEXT_ON_COLOR
    : DARK_TEXT_ON_COLOR;

  if (!onChange) {
    return (
      <div
        className="inline-flex items-center rounded-sm px-1.5 py-0.5"
        style={{ backgroundColor: titleColor }}
      >
        <span
          className="text-14 leading-[20px] tracking-tight-1 overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: titleTextColor }}
        >
          {value || resolvedPlaceholder}
        </span>
      </div>
    );
  }

  const isDirty = isFocused && value !== valueOnFocusRef.current;
  const isEditing = isFocused;

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-sm border pl-1.5 py-0.5 pr-1 transition-colors"
      style={{
        borderColor: isEditing ? titleColor : 'transparent',
        backgroundColor: isEditing ? 'var(--surfacegray-high)' : titleColor,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (value !== valueOnFocusRef.current) {
              e.stopPropagation();
              onChange(valueOnFocusRef.current);
            }
            inputRef.current?.blur();
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            confirmedRef.current = true;
            onConfirm?.();
            inputRef.current?.blur();
          }
        }}
        onFocus={() => {
          valueOnFocusRef.current = value;
          setIsFocused(true);
        }}
        onBlur={() => {
          if (!confirmedRef.current && value !== valueOnFocusRef.current) {
            onChange(valueOnFocusRef.current);
          }
          confirmedRef.current = false;
          setIsFocused(false);
        }}
        placeholder={resolvedPlaceholder}
        className={`
          min-w-[32px] bg-transparent border-none outline-none [field-sizing:content]
          text-14 leading-[20px] tracking-tight-1
          ${isEditing ? 'text-[var(--text-primary)] placeholder-[var(--text-secondary)] caret-[var(--text-primary)]' : ''}
        `}
        style={
          isEditing
            ? undefined
            : { color: titleTextColor, caretColor: titleTextColor }
        }
      />
      {isDirty && (
        <Button
          variant="ghost"
          size="xs"
          icon={<Check className="!text-[10px] text-inherit" />}
          aria-label={t('modal.confirm')}
          className="!h-4 !w-4 !min-w-0 !rounded-[2px] !p-0"
          style={{ backgroundColor: titleColor, color: titleTextColor }}
          onMouseDown={(e) => {
            e.preventDefault();
            confirmedRef.current = true;
            onConfirm?.();
            inputRef.current?.blur();
          }}
        />
      )}
    </div>
  );
}

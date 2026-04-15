import React, { isValidElement } from 'react';
import classNames from 'classnames';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';

export type DropdownItemIcon = IconVariant | React.ReactElement;

export type DropdownItemVariant = 'default' | 'negative';

export interface DropdownItem {
  label: string;
  value: string;
  leftIcon?: DropdownItemIcon;
  rightIcon?: DropdownItemIcon;

  caption?: string;
  variant?: DropdownItemVariant;
}

const ITEM_TYPOGRAPHY = 'text-14 leading-20 font-normal tracking-tight-1';
const CAPTION_TYPOGRAPHY = 'text-10 leading-12 tracking-tight-1';

/** Figma node-id=2050:21538 — standard item button styles */
export const DROPDOWN_ITEM_CLASSES =
  'group flex items-center w-full px-spacing-6 text-left outline-none hover:bg-blackinverse-a4 focus-visible:bg-blackinverse-a4 active:bg-blackinverse-a6 transition-colors';

/** Icon slot inside a dropdown item — accepts IconVariant string or React element */
export function DropdownItemIconSlot({
  icon,
  variant,
}: {
  icon: DropdownItemIcon;
  variant?: DropdownItemVariant;
}) {
  const iconInteractiveClass =
    variant === 'negative'
      ? 'group-hover:text-colors-status_negative_base group-focus-visible:text-colors-status_negative_base group-active:text-colors-status_negative_base'
      : 'group-hover:text-blackinverse-a100 group-focus-visible:text-blackinverse-a100 group-active:text-blackinverse-a100';
  return (
    <div className="w-spacing-36 h-spacing-36 flex items-center justify-center shrink-0">
      {isValidElement(icon) ? (
        icon
      ) : (
        <Icon
          variant={icon as IconVariant}
          size={20}
          className={`text-blackinverse-a56 ${iconInteractiveClass}`}
        />
      )}
    </div>
  );
}

/** Color classes for item text, based on variant and active state */
function getItemColorClasses(
  variant: DropdownItemVariant = 'default',
  isActive?: boolean
): string {
  if (isActive) {
    return variant === 'negative'
      ? 'text-colors-status_negative_base'
      : 'text-blackinverse-a100';
  }
  if (variant === 'negative') {
    return 'text-blackinverse-a56 group-hover:text-colors-status_negative_base group-focus-visible:text-colors-status_negative_base group-active:text-colors-status_negative_base';
  }
  return 'text-blackinverse-a56 group-hover:text-blackinverse-a100 group-focus-visible:text-blackinverse-a100 group-active:text-blackinverse-a100';
}

/** Text classes for the middle part of a dropdown item (layout + typography + color) */
export function getItemTextClasses(
  variant: DropdownItemVariant = 'default',
  isActive?: boolean
): string {
  return `flex-1 ${ITEM_TYPOGRAPHY} py-spacing-8 px-spacing-4 ${getItemColorClasses(variant, isActive)}`;
}

/** Middle text part of a dropdown item — label with optional caption */
export function DropdownItemText({
  label,
  caption,
  variant,
  isActive,
}: {
  label: string;
  caption?: string;
  variant?: DropdownItemVariant;
  isActive?: boolean;
}) {
  if (caption) {
    return (
      <div className="flex-1 flex flex-col py-spacing-8 px-spacing-4">
        <span
          className={classNames(
            ITEM_TYPOGRAPHY,
            getItemColorClasses(variant, isActive)
          )}
        >
          {label}
        </span>
        <span className={`${CAPTION_TYPOGRAPHY} text-blackinverse-a32`}>
          {caption}
        </span>
      </div>
    );
  }
  return <span className={getItemTextClasses(variant, isActive)}>{label}</span>;
}

/**
 * DropdownItemButton — pre-styled dropdown menu item
 *
 * Figma node-id=55839:4998 (default) / 60552:525 (negative)
 */
export function DropdownItemButton({
  item,
  isActive,
  onClick,
}: {
  item: DropdownItem;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={DROPDOWN_ITEM_CLASSES}
    >
      {item.leftIcon && (
        <DropdownItemIconSlot icon={item.leftIcon} variant={item.variant} />
      )}
      <DropdownItemText
        label={item.label}
        caption={item.caption}
        variant={item.variant}
        isActive={isActive}
      />
      {item.rightIcon && (
        <DropdownItemIconSlot icon={item.rightIcon} variant={item.variant} />
      )}
    </button>
  );
}

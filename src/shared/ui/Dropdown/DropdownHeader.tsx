import classNames from 'classnames';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';

/** Figma node-id=61006:8413 — dropdownHead/Theme item */
export type DropdownHeaderThemeValue = 'light' | 'system' | 'dark';

export interface DropdownHeaderProps {
  activeTheme?: DropdownHeaderThemeValue;
  onThemeChange?: (theme: DropdownHeaderThemeValue) => void;
}

const THEME_ICONS: { value: DropdownHeaderThemeValue; icon: IconVariant }[] = [
  { value: 'light', icon: 'themeLight' },
  { value: 'system', icon: 'themeSystem' },
  { value: 'dark', icon: 'themeDark' },
];

/** Theme header row for Dropdown — 3 icon buttons (light/system/dark) */
export function DropdownHeader({
  activeTheme,
  onThemeChange,
}: DropdownHeaderProps) {
  return (
    <div className="flex pb-spacing-6">
      {THEME_ICONS.map(({ value, icon }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onThemeChange?.(value)}
            className={classNames(
              'group flex-1 flex items-center justify-center p-spacing-12 transition-colors',
              isActive
                ? 'bg-brand-bg_deep'
                : 'bg-blackinverse-a2 hover:bg-blackinverse-a4'
            )}
          >
            <Icon
              variant={icon}
              size={20}
              className={classNames(
                'transition-colors',
                isActive
                  ? 'text-brand-base'
                  : 'text-blackinverse-a56 group-hover:text-blackinverse-a100'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

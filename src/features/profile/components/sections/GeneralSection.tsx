'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Icon, IconVariant } from '@/shared/ui/Icon';
import { ListItemApp } from '@/shared/ui/ListItemApp';
import RadioButton from '@/shared/ui/RadioButton';
import { useTranslation } from '@/shared/i18n/client';

type ThemeOption = {
  id: 'light' | 'dark' | 'system';
  iconVariant: IconVariant;
};

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light', iconVariant: 'themeLight' },
  { id: 'dark', iconVariant: 'themeDark' },
  { id: 'system', iconVariant: 'themeSystem' },
];

/**
 * GeneralSection — Profile general settings
 *
 * Figma node: 962:88537
 */
const GeneralSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-spacing-40 w-[412px]">
      {/* Appearance */}
      <div className="flex flex-col gap-spacing-16">
        <h3 className="text-20 font-semibold leading-24 tracking-tight-2 text-blackinverse-a100 px-spacing-16">
          {t('general.appearance')}
        </h3>
        <div className="flex flex-col gap-spacing-10">
          {THEME_OPTIONS.map((option) => (
            <ListItemApp
              key={option.id}
              leading={
                <Icon
                  variant={option.iconVariant}
                  size={24}
                  className="text-blackinverse-a56"
                />
              }
              title={t(`general.theme.${option.id}`)}
              trailing={
                <RadioButton
                  checked={theme === option.id}
                  // pointer-events-none + tabIndex={-1} — click handled by ListItemApp onClick above
                  onChange={() => {}}
                  size="lg"
                  variant="accent"
                  className="pointer-events-none"
                  tabIndex={-1}
                />
              }
              onClick={() => setTheme(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;

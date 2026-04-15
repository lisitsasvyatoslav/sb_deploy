import type { Preview } from '@storybook/nextjs';
import React, { useEffect, useMemo } from 'react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MotionProvider } from '../src/shared/ui/MotionProvider';
import i18n from '../src/shared/i18n/client';
import { LocaleContext } from '../src/shared/i18n/locale-provider';

import '../tokens/theme-variables.css';
import '../tokens/brand-lime.css';
import '../tokens/brand-finam.css';
import '../app/globals.css';

const REGION_BRAND_MAP: Record<string, string> = {
  ru: 'finam',
  us: 'lime',
};

const preview: Preview = {
  globalTypes: {
    region: {
      description: 'Deployment region (controls brand colors)',
      toolbar: {
        title: 'Region',
        icon: 'globe',
        items: [
          { value: 'ru', title: 'RU (Finam)', right: '🇷🇺' },
          { value: 'us', title: 'US (Lime)', right: '🇺🇸' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'UI language',
      toolbar: {
        title: 'Locale',
        icon: 'transfer',
        items: [
          { value: 'ru', title: 'Русский' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    region: 'ru',
    locale: 'ru',
  },

  decorators: [
    // Переключатель тем light/dark через data-theme атрибут (как в продакшне)
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    // Базовая обёртка: бренд, локаль, фон + шрифт
    (Story, context) => {
      const region = context.globals.region || 'ru';
      const locale = context.globals.locale || 'ru';
      const brand = REGION_BRAND_MAP[region] || 'finam';

      useEffect(() => {
        document.documentElement.setAttribute('data-brand', brand);
        return () => {
          document.documentElement.removeAttribute('data-brand');
        };
      }, [brand]);

      useEffect(() => {
        i18n.changeLanguage(locale);
        document.documentElement.lang = locale;
      }, [locale]);

      const localeContextValue = useMemo(
        () => ({
          locale: locale as 'ru' | 'en',
          setLocale: (newLocale: 'ru' | 'en') => {
            i18n.changeLanguage(newLocale);
          },
          toggleLocale: () => {
            i18n.changeLanguage(locale === 'ru' ? 'en' : 'ru');
          },
        }),
        [locale]
      );

      return (
        <LocaleContext value={localeContextValue}>
          <MotionProvider>
            <div
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: 'var(--bg-base, #ECECF0)',
                minHeight: '100vh',
                padding: '1rem',
              }}
            >
              <Story />
            </div>
          </MotionProvider>
        </LocaleContext>
      );
    },
  ],

  parameters: {
    // Отключаем стандартный backgrounds — используем theme-декоратор
    backgrounds: { disabled: true },

    layout: 'centered',

    controls: {
      matchers: {
        color: /(background|color|bg|fill|Color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },

    actions: { argTypesRegex: '^on[A-Z].*' },

    // Указываем, что используем app/ директорию Next.js
    nextjs: { appDirectory: true },

    docs: { toc: true },
  },
};

export default preview;

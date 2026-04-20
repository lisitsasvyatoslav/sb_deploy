import { currentRegionConfig } from '@/shared/config/region';

export const FALLBACK_LOCALE = currentRegionConfig.defaultLocale;
export const SUPPORTED_LOCALES = currentRegionConfig.availableLocales;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const LANGUAGE_COOKIE = 'NEXT_LOCALE';
export const DEFAULT_NAMESPACE = 'common';

export const NAMESPACES = ['common', 'board'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TranslateFn = (key: any, options?: any) => string;

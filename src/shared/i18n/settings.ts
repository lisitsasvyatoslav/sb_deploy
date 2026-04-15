import { currentRegionConfig } from '@/shared/config/region';

export const FALLBACK_LOCALE = currentRegionConfig.defaultLocale;
export const SUPPORTED_LOCALES = currentRegionConfig.availableLocales;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const LANGUAGE_COOKIE = 'NEXT_LOCALE';
export const DEFAULT_NAMESPACE = 'common';

export const NAMESPACES = [
  'common',
  'auth',
  'board',
  'chat',
  'statistics',
  'ticker',
  'signal',
  'broker',
  'portfolio',
  'errors',
  'profile',
] as const;

/**
 * Namespace-agnostic translate function type.
 * Use this when a helper needs to accept a `t` from any namespace.
 * Compatible with i18next TFunction (uses explicit params instead of rest to
 * satisfy tuple-parameter assignability).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TranslateFn = (key: any, options?: any) => string;

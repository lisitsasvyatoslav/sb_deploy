'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from './client';
import {
  LANGUAGE_COOKIE,
  SUPPORTED_LOCALES,
  FALLBACK_LOCALE,
  type Locale,
} from './settings';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Read NEXT_LOCALE cookie synchronously (browser only). */
function detectCookieLocale(): Locale {
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : FALLBACK_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const router = useRouter();
  const locale = (i18nInstance.language || FALLBACK_LOCALE) as Locale;

  // Sync i18n to the real cookie locale after hydration, before browser paint.
  // i18n initializes with FALLBACK_LOCALE ('en') to match SSR output and avoid
  // hydration mismatches. useLayoutEffect fires synchronously post-hydration so
  // users see the correct locale without a visible flash.
  useLayoutEffect(() => {
    const detected = detectCookieLocale();
    if (detected !== i18nInstance.language) {
      i18nInstance.changeLanguage(detected);
      document.documentElement.lang = detected;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!(SUPPORTED_LOCALES as readonly string[]).includes(newLocale)) return;
      document.cookie = `${LANGUAGE_COOKIE}=${newLocale};path=/;max-age=31536000;samesite=lax`;
      i18nInstance.changeLanguage(newLocale);
      // Update <html lang> immediately
      document.documentElement.lang = newLocale;
      router.refresh();
    },
    [i18nInstance, router]
  );

  const toggleLocale = useCallback(() => {
    if (SUPPORTED_LOCALES.length <= 1) return;
    const currentIdx = (SUPPORTED_LOCALES as readonly string[]).indexOf(locale);
    const nextIdx = (currentIdx + 1) % SUPPORTED_LOCALES.length;
    setLocale(SUPPORTED_LOCALES[nextIdx] as Locale);
  }, [locale, setLocale]);

  return (
    <LocaleContext value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

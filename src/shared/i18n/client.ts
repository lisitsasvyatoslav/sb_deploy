'use client';

import i18n from 'i18next';

import {
  initReactI18next,
  useTranslation as useI18nextTranslation,
} from 'react-i18next';
import {
  FALLBACK_LOCALE,
  SUPPORTED_LOCALES,
  DEFAULT_NAMESPACE,
} from './settings';

// Import all locale resources statically (bundled, <1000 keys total)
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enBoard from './locales/en/board.json';
import enChat from './locales/en/chat.json';
import enStatistics from './locales/en/statistics.json';
import enTicker from './locales/en/ticker.json';
import enSignal from './locales/en/signal.json';
import enBroker from './locales/en/broker.json';
import enPortfolio from './locales/en/portfolio.json';
import enErrors from './locales/en/errors.json';
import enProfile from './locales/en/profile.json';

import ruCommon from './locales/ru/common.json';
import ruAuth from './locales/ru/auth.json';
import ruBoard from './locales/ru/board.json';
import ruChat from './locales/ru/chat.json';
import ruStatistics from './locales/ru/statistics.json';
import ruTicker from './locales/ru/ticker.json';
import ruSignal from './locales/ru/signal.json';
import ruBroker from './locales/ru/broker.json';
import ruPortfolio from './locales/ru/portfolio.json';
import ruErrors from './locales/ru/errors.json';
import ruProfile from './locales/ru/profile.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    board: enBoard,
    chat: enChat,
    statistics: enStatistics,
    ticker: enTicker,
    signal: enSignal,
    broker: enBroker,
    portfolio: enPortfolio,
    errors: enErrors,
    profile: enProfile,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    board: ruBoard,
    chat: ruChat,
    statistics: ruStatistics,
    ticker: ruTicker,
    signal: ruSignal,
    broker: ruBroker,
    portfolio: ruPortfolio,
    errors: ruErrors,
    profile: ruProfile,
  },
};

// Initialize without LanguageDetector so server and client both start with FALLBACK_LOCALE.
// This prevents SSR/hydration mismatches where the server renders with 'en' (no cookie access)
// but the client detects 'ru' from the cookie — causing React hydration errors.
// LocaleProvider detects the real locale from the cookie via useLayoutEffect after hydration.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: FALLBACK_LOCALE,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'languageOnly', // Strip region codes (e.g. ru-RU → ru) before matching
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  });
}

export default i18n;

// Re-export useTranslation so components import from @/i18n/client
export const useTranslation = useI18nextTranslation;

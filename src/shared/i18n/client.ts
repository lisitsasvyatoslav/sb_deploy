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

import enCommon from './locales/en/common.json';
import enBoard from './locales/en/board.json';

import ruCommon from './locales/ru/common.json';
import ruBoard from './locales/ru/board.json';

const resources = {
  en: {
    common: enCommon,
    board: enBoard,
  },
  ru: {
    common: ruCommon,
    board: ruBoard,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: FALLBACK_LOCALE,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'languageOnly',
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;

export const useTranslation = useI18nextTranslation;

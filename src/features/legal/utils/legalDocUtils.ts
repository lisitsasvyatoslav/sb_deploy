export type LegalDocLabelKey =
  | 'legal.terms'
  | 'legal.privacyPolicy'
  | 'legal.cookiePolicy'
  | 'legal.disclaimer';

export interface LegalDocMeta {
  key: string;
  /** i18n key inside 'profile' namespace */
  labelKey: LegalDocLabelKey;
  /** API path relative to apiClient baseURL */
  apiPath: string;
  /** Route in the guest zone */
  guestPath: string;
  /** Route in the authenticated settings zone */
  appPath: string;
}

export const LEGAL_DOCS_META: LegalDocMeta[] = [
  {
    key: 'privacy-policy',
    labelKey: 'legal.privacyPolicy',
    apiPath: '/privacy-policy',
    guestPath: '/privacy-policy',
    appPath: '/profile/legal/privacy-policy',
  },
  {
    key: 'cookie-policy',
    labelKey: 'legal.cookiePolicy',
    apiPath: '/cookie-policy',
    guestPath: '/cookie-policy',
    appPath: '/profile/legal/cookie-policy',
  },
  {
    key: 'terms',
    labelKey: 'legal.terms',
    apiPath: '/terms',
    guestPath: '/terms',
    appPath: '/profile/legal/terms',
  },
  {
    key: 'disclaimer',
    labelKey: 'legal.disclaimer',
    apiPath: '/disclaimer',
    guestPath: '/disclaimer',
    appPath: '/profile/legal/disclaimer',
  },
];

/** "1.", "2.1.", "4.2.1." numbered headings or fully-uppercase headings */
export function isSubtitle(paragraph: string): boolean {
  const p = paragraph.trim();
  if (/^\d+(\.\d+)*\.\s/.test(p)) return true;
  // Only fully-uppercase phrases qualify as unnumbered headings
  return (
    p.length >= 3 &&
    p.length <= 80 &&
    p === p.toUpperCase() &&
    /^[А-ЯЁA-Z]/.test(p)
  );
}

/** List item: ends with ";" — displayed with bullet */
export function isBulletItem(paragraph: string): boolean {
  return paragraph.trim().endsWith(';');
}

/** First non-empty paragraph → doc title, rest → body */
export function splitContent(raw: string): {
  title: string;
  paragraphs: string[];
} {
  const parts = raw
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { title: '', paragraphs: [] };
  return { title: parts[0], paragraphs: parts.slice(1) };
}

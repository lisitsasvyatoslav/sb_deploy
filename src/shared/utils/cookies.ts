import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Cookie options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // Only use secure in production
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_EXPIRES = 1 / 24; // 1 hour
const REFRESH_TOKEN_EXPIRES = 30; // 30 days to match backend session TTL

const TOKEN_EXPIRY_BUFFER_SECONDS = 45;

export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return (
    payload.exp <= Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_BUFFER_SECONDS
  );
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000 - Date.now();
}

// Testing bot detection
const TESTING_BOT_KEY = 'is_testing_bot';
let testingBotCached: boolean | null = null;

/**
 * Check if the current session is an automated test bot.
 * Reads `is_testing_bot` cookie once and caches the result for the page lifetime.
 * When true, analytics (Yandex Metrika, PostHog) should be disabled.
 */
export function isTestingBot(): boolean {
  if (testingBotCached !== null) return testingBotCached;
  testingBotCached = Cookies.get(TESTING_BOT_KEY) === 'true';
  return testingBotCached;
}

export const cookieStorage = {
  getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  isAccessTokenValid(): boolean {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (!token) return false;
    return !isTokenExpired(token);
  },

  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      ...COOKIE_OPTIONS,
      expires: ACCESS_TOKEN_EXPIRES,
    });
  },

  setRefreshToken(token: string): void {
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      ...COOKIE_OPTIONS,
      expires: REFRESH_TOKEN_EXPIRES,
    });
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  },

  clearTokens(): void {
    Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
  },

  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },

  // Cookie Policy Acceptance
  getCookiePolicyVersion(): number | null {
    const value = Cookies.get('cookie_policy_accepted');
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  },

  getCookiePolicyAcceptance(): boolean {
    return this.getCookiePolicyVersion() !== null;
  },

  setCookiePolicyAcceptance(version: number): void {
    Cookies.set('cookie_policy_accepted', String(version), {
      ...COOKIE_OPTIONS,
      expires: 90,
    });
  },

  clearCookiePolicyAcceptance(): void {
    Cookies.remove('cookie_policy_accepted', { path: '/' });
  },
};

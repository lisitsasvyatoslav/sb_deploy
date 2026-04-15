import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import { useChatStore } from '@/stores/chatStore';

// Helpers for Yandex Metrika product goals: sidebar state, device class, and
// client-persisted registration time (used by `active`; cleared on logout).

/** Viewport width at or below this value is reported as mobile for YM `active`. */
export const YM_MOBILE_BREAKPOINT_PX = 768;

/** localStorage key prefix: `${prefix}${userId}` stores ISO time set on signup. */
export const YM_REGISTERED_AT_KEY_PREFIX = 'ym_registered_at_v1:';

/** sessionStorage: set after `active` is sent once per tab session. */
export const YM_ACTIVE_SESSION_STORAGE_KEY = 'ym_active_sent_v1';

export type YmOnOff = 'on' | 'off';

function toOnOff(open: boolean): YmOnOff {
  return open ? 'on' : 'off';
}

export function ymRegisteredAtStorageKey(userId: string): string {
  return `${YM_REGISTERED_AT_KEY_PREFIX}${userId}`;
}

/** For YM `active.device` and similar. */
export function getYmDeviceType(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia(`(max-width: ${YM_MOBILE_BREAKPOINT_PX}px)`).matches
    ? 'mobile'
    : 'desktop';
}

/** News sidebar + chat sidebar open state as `on` | `off` for login/register/logout/active goals. */
export function getYmSidebarEngagementParams(): {
  explore: YmOnOff;
  chat: YmOnOff;
} {
  return {
    explore: toOnOff(useNewsSidebarStore.getState().isOpen),
    chat: toOnOff(useChatStore.getState().isChatSidebarOpen),
  };
}

/** Called after successful email/password registration; backs YM `registration_date` / retention. */
export function setClientRegistrationTimestamp(userId: string | null): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      ymRegisteredAtStorageKey(userId),
      new Date().toISOString()
    );
  } catch {
    /* noop */
  }
}

/** ISO string from localStorage for YM `active.registration_date`, if present. */
export function readClientRegistrationTimestamp(
  userId: string | null
): string | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ymRegisteredAtStorageKey(userId));
  } catch {
    return null;
  }
}

/** Invoked from clearAuth so the next account on this browser does not reuse the previous user's timestamp. */
export function clearClientRegistrationTimestamp(userId: string | null): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ymRegisteredAtStorageKey(userId));
  } catch {
    /* noop */
  }
}

/** Cleared on logout so `active` can fire again on the next authenticated session. */
export function clearYmActiveSessionSentFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(YM_ACTIVE_SESSION_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** Whole days between client registration timestamp and current session start (YM `retention`). */
export function retentionDaysBetween(
  registrationIso: string,
  sessionStartedIso: string
): number {
  const start = Date.parse(registrationIso);
  const end = Date.parse(sessionStartedIso);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

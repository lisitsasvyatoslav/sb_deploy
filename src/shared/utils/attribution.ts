import { attributionApi } from '@/services/api/attribution';
import { useAuthStore } from '@/stores/authStore';
import type { AttributionEventPayload } from '@/types/attribution';
import { getOrCreateSessionId } from '@/shared/utils/utm';
import { logger } from '@/shared/utils/logger';

const STORAGE_KEY = 'td_attribution_queue';
const MAX_QUEUE = 50;
const MAX_VARCHAR = 255;
const MAX_URL = 8192;

/** UTM query params — без них события в user_attribution_events не создаём. */
const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
] as const;

const TRACKED_SEARCH_KEYS = [
  ...UTM_PARAM_KEYS,
  'gclid',
  'yclid',
  'fbclid',
] as const;

/** Если в query передан реальный лендинг — используем его вместо текущего `location.href`. */
const LANDING_URL_QUERY_KEYS = ['landing_url'] as const;

function hasUtmTags(
  e: Partial<AttributionEventPayload> | AttributionEventPayload
): boolean {
  for (const key of UTM_PARAM_KEYS) {
    const v = (e as Record<string, unknown>)[key];
    if (typeof v === 'string' && v.trim() !== '') return true;
  }
  return false;
}

function trunc(s: string | undefined, max: number): string | undefined {
  if (s == null || s === '') return undefined;
  const t = s.trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

function parseLandingUrlFromSearch(search: string): string | undefined {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search
  );
  for (const key of LANDING_URL_QUERY_KEYS) {
    const raw = params.get(key)?.trim();
    if (!raw) continue;
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch {
      /* keep raw */
    }
    const t = trunc(decoded, MAX_URL);
    if (t) return t;
  }
  return undefined;
}

function parseAttributionFromSearch(
  search: string
): Partial<AttributionEventPayload> {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search
  );
  const out: Partial<AttributionEventPayload> = {};
  for (const key of TRACKED_SEARCH_KEYS) {
    const v = params.get(key) ?? undefined;
    const t = trunc(v, MAX_VARCHAR);
    if (t) {
      (out as Record<string, string>)[key] = t;
    }
  }
  return out;
}

function parseGaClientId(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!m) return undefined;
  const raw = decodeURIComponent(m[1].trim());
  const parts = raw.split('.');
  if (parts.length >= 4) {
    return trunc(`${parts[2]}.${parts[3]}`, MAX_VARCHAR);
  }
  return undefined;
}

function parseYmUid(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
  if (!m) return undefined;
  return trunc(decodeURIComponent(m[1].trim()), MAX_VARCHAR);
}

export function readAttributionQueue(): AttributionEventPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is AttributionEventPayload =>
        e != null &&
        typeof e === 'object' &&
        typeof (e as AttributionEventPayload).event_type === 'string' &&
        typeof (e as AttributionEventPayload).captured_at === 'string'
    );
  } catch {
    return [];
  }
}

function writeAttributionQueue(events: AttributionEventPayload[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('attribution', 'Failed to persist attribution queue', e);
    }
  }
}

function trimQueue(
  events: AttributionEventPayload[]
): AttributionEventPayload[] {
  if (events.length <= MAX_QUEUE) return events;
  if (process.env.NODE_ENV === 'development') {
    logger.warn(
      'attribution',
      `Attribution queue exceeded ${MAX_QUEUE}; dropping oldest`
    );
  }
  return events.slice(events.length - MAX_QUEUE);
}

export function clearAttributionQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function enqueueAttributionEvent(event: AttributionEventPayload): void {
  if (!hasUtmTags(event)) return;
  const next = trimQueue([...readAttributionQueue(), event]);
  writeAttributionQueue(next);
}

export function buildAttributionEvent(
  eventType: AttributionEventPayload['event_type'],
  sessionId: string
): AttributionEventPayload {
  const search =
    typeof window !== 'undefined' ? window.location.search || '' : '';
  const fromQuery = parseAttributionFromSearch(search);

  const landingFromQuery = parseLandingUrlFromSearch(search);
  const landingFallback =
    typeof window !== 'undefined'
      ? trunc(window.location.href, MAX_URL)
      : undefined;
  const landing = landingFromQuery ?? landingFallback;
  const referrer =
    typeof document !== 'undefined' && document.referrer
      ? trunc(document.referrer, MAX_URL)
      : undefined;

  return {
    session_id: trunc(sessionId, 64),
    event_type: eventType,
    ...fromQuery,
    google_client_id: parseGaClientId(),
    yandex_client_id: parseYmUid(),
    landing_url: landing,
    referrer_url: referrer,
    captured_at: new Date().toISOString(),
  };
}

/**
 * After successful login/signup (JWT available), send queued pre-auth events
 * plus one login/signup row. Clears queue only on success.
 */
export async function flushAttributionAfterAuth(
  reason: 'login' | 'signup'
): Promise<void> {
  if (typeof window === 'undefined') return;
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.accessToken) return;

  const queued = readAttributionQueue();
  const queuedUtm = queued.filter(hasUtmTags);
  const sessionId = getOrCreateSessionId();
  const authEvent = buildAttributionEvent(reason, sessionId);
  const withAuth = hasUtmTags(authEvent) ? [authEvent] : [];
  const events = [...queuedUtm, ...withAuth];

  if (events.length === 0) {
    if (queued.length !== queuedUtm.length) {
      writeAttributionQueue(queuedUtm);
    }
    return;
  }

  const ok = await attributionApi.postEvents(events);
  if (ok) {
    clearAttributionQueue();
  }
}

/**
 * When authenticated, try to send any pending queue (e.g. after failed sends).
 */
export async function drainAttributionQueueIfAuthenticated(): Promise<void> {
  if (typeof window === 'undefined') return;
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.accessToken) return;
  const queued = readAttributionQueue();
  const utmOnly = queued.filter(hasUtmTags);
  if (queued.length !== utmOnly.length) {
    writeAttributionQueue(utmOnly);
  }
  if (!utmOnly.length) return;
  const ok = await attributionApi.postEvents(utmOnly);
  if (ok) {
    clearAttributionQueue();
  }
}

/**
 * Record a session_start for the current URL: queue if anonymous, else POST.
 */
export async function captureAttributionSessionStart(): Promise<void> {
  if (typeof window === 'undefined') return;
  const sessionId = getOrCreateSessionId();
  const event = buildAttributionEvent('session_start', sessionId);
  if (!hasUtmTags(event)) return;

  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.accessToken) {
    enqueueAttributionEvent(event);
    return;
  }

  const ok = await attributionApi.postEvents([event]);
  if (!ok) {
    enqueueAttributionEvent(event);
  }
}

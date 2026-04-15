/**
 * UTM tracking utilities.
 *
 * Responsibilities:
 * - Parse UTM parameters from the current URL
 * - Persist them in sessionStorage for the lifetime of the browser tab
 * - Generate / restore a stable session ID for the tab
 */

const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
] as const;

const SESSION_KEY = 'td_utm_data';
const SESSION_ID_KEY = 'td_utm_session_id';

export interface UtmData {
  session_id: string;
  utm_raw: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  /** Present when URL contained utm_id (omitted in legacy sessionStorage payloads). */
  utm_id?: string | null;
}

/**
 * Parse UTM params from the current URL.
 * Returns null when no UTM parameters are present.
 */
export function parseUtmFromUrl(): Omit<UtmData, 'session_id'> | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const hasUtm = UTM_PARAMS.some((p) => params.has(p));
  if (!hasUtm) return null;

  const utmParams = new URLSearchParams();
  UTM_PARAMS.forEach((p) => {
    const v = params.get(p);
    if (v) utmParams.set(p, v);
  });

  return {
    utm_raw: utmParams.toString() || null,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    utm_id: params.get('utm_id'),
  };
}

/**
 * Get or create a stable session ID for the current tab (survives page refreshes
 * within the same tab but resets when the tab is closed).
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

/** Persist UTM data to sessionStorage. */
export function saveUtmToSession(utm: Omit<UtmData, 'session_id'>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(utm));
}

/** Retrieve previously stored UTM data, or null if not present. */
export function getStoredUtm(): Omit<UtmData, 'session_id'> | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Omit<UtmData, 'session_id'>;
  } catch {
    return null;
  }
}

/**
 * Build a complete UtmData object from sessionStorage.
 * Returns null if no UTM has ever been captured in this session.
 */
export function getFullUtmData(): UtmData | null {
  const utm = getStoredUtm();
  if (!utm) return null;
  const session_id = getOrCreateSessionId();
  return { session_id, ...utm };
}

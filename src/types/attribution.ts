export type AttributionEventType = 'session_start' | 'signup' | 'login';

/** Body item for POST /api/attribution/events (snake_case per API contract) */
export interface AttributionEventPayload {
  session_id?: string;
  event_type: AttributionEventType;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  gclid?: string;
  yclid?: string;
  fbclid?: string;
  google_client_id?: string;
  yandex_client_id?: string;
  /** Текущий URL или значение из query `landing_url` / `landing`, если передано. */
  landing_url?: string;
  referrer_url?: string;
  captured_at: string;
}

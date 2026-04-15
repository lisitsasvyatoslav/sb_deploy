/**
 * Chart environment — loads mf-loader, auth widget and chart widget together,
 * performs auth, and provides TxChart instances.
 *
 * Auth strategy (TxGlobalAuth.init always runs — chart widget depends on it):
 *  1. NEXT_PUBLIC_CHART_STATIC_TOKEN is set → use static token, skip authorizeAnonymously (realtime data)
 *  2. Fallback → authorizeAnonymously + getTokenProvider (15-min delayed data)
 *
 * - createChartInstance() → for regular securities (SBER etc)
 */

import { REGION } from '@/shared/config/region';

import type {
  TxChartWidgetInstance,
  TxChartModule,
  TxChartTokenProvider,
  TxChartConfigOptions,
} from '@/types/txchart';
import { logger } from '@/shared/utils/logger';

export type { TxChartWidgetInstance, TxChartTokenProvider };

const LOG_TAG = 'Chart';

// URLs
const MF_LOADER_URL = 'https://libs-cdn.finam.ru/mf-loader/@1.js';

// ─── Script loading helpers ───

function loadScriptTag(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('script tag blocked'));
    };
    document.head.appendChild(script);
  });
}

async function loadViaBlobUrl(url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`fetch returned ${response.status} ${response.statusText}`);
  }
  const code = await response.text();
  const blob = new Blob([code], { type: 'text/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    await loadScriptTag(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function loadScript(url: string): Promise<void> {
  try {
    await loadScriptTag(url);
  } catch {
    logger.warn(LOG_TAG, `<script> blocked for ${url}, using fetch+blob`);
    await loadViaBlobUrl(url);
  }
}

// ─── mf-loader ───

let mfLoaderReady: Promise<void> | null = null;

function ensureMfLoader(): Promise<void> {
  if (!mfLoaderReady) {
    mfLoaderReady = (async () => {
      if (typeof window.loadFederatedModule === 'function') return;
      await loadScript(MF_LOADER_URL);
      if (typeof window.loadFederatedModule !== 'function') {
        throw new Error(
          'mf-loader loaded but loadFederatedModule not found on window'
        );
      }
      logger.debug(LOG_TAG, 'mf-loader ready');
    })().catch((err) => {
      mfLoaderReady = null;
      throw err;
    });
  }
  return mfLoaderReady;
}

// ─── Shared init: modules + auth (once) ───

interface SharedInit {
  chartModule: TxChartModule;
  tokenProvider: TxChartTokenProvider;
}

let sharedInitPromise: Promise<SharedInit> | null = null;

function ensureSharedInit(): Promise<SharedInit> {
  if (!sharedInitPromise) {
    sharedInitPromise = doSharedInit().catch((err) => {
      sharedInitPromise = null;
      throw err;
    });
  }
  return sharedInitPromise;
}

/** Module-level flag — replaces prototype property hack for tracking patch state */
let txChartDebugPatched = false;

async function doSharedInit(): Promise<SharedInit> {
  const chartWidgetUrl =
    process.env.NEXT_PUBLIC_CHART_WIDGET_URL ||
    'https://widgets-cdn.finam.ru/chart/v8/mf/widget.js';

  // 1. Load mf-loader
  await ensureMfLoader();

  // 2. Enable txChartDebug in development only.
  //    TxChart reads this flag via URLSearchParams on view/pitch changes,
  //    creating new URLSearchParams instances internally each time.
  //    Without the patch, view switches fail silently in dev.
  if (process.env.NODE_ENV === 'development' && !txChartDebugPatched) {
    const origGet = URLSearchParams.prototype.get;
    URLSearchParams.prototype.get = function (key: string) {
      if (key === 'txChartDebug') return '1';
      return origGet.call(this, key);
    };
    txChartDebugPatched = true;
    logger.debug(LOG_TAG, 'URLSearchParams patched (txChartDebug=1, dev only)');
  }

  // 3b. Full auth flow (no static token — anonymous, 15-min delayed data)
  logger.debug(LOG_TAG, 'Loading auth widget + chart widget...');
  const [txChartModule] = await Promise.all([
    window.loadFederatedModule!(
      chartWidgetUrl,
      'txChartWidget'
    ) as Promise<TxChartModule>,
  ]);

  const tokenProvider: TxChartTokenProvider = {
    getFreshToken: () =>
      Promise.resolve(
        'eyJraWQiOiI0ODVlYWEzYy1jYzA0LTRkYmYtOGRlNC03MGJjYzk5ZmVlYjUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhcmVhIjoidHQiLCJzY29udGV4dCI6IkNnc0lCeElIZEdWemRHbHVad29vQ0FNU0pEWXpNRFJoWkRSbUxUQXpPRGd0TkRGbU15MDRaV1F6TFRWbVptVXhaR0k1TnpGak1nb0VDQVVTQUFvTENBQVNCM1JsYzNScGJtY0tLQWdDRWlSaFpqazVOMkZpTmkwelpUQmhMVFJtWlRRdFlXVTNPQzFsTjJZM01qZzBNalJpTVdNS0JRZ0lFZ0V4Q2dRSUNSSUFDZ1FJQ2hJQUNpZ0lCQklrTkRnMVpXRmhNMk10WTJNd05DMDBaR0ptTFRoa1pUUXROekJpWTJNNU9XWmxaV0kxR2d3SW5KM2t6UVlRd1B2VTh3RWlEQWljMGFEUUJoREErOVR6QVNnQk1oY0tEMFpVWDB0U1FWUlBVMTlEVWtWRVV5b0VSa0ZMUlEiLCJ6aXBwZWQiOnRydWUsImNyZWF0ZWQiOiIxNzczNzM1NTgwIiwicmVuZXdFeHAiOiIxNzc4OTE5NjQwIiwic2VzcyI6Ikg0c0lBQUFBQUFBQS81Tmk0MkRVWWxKZ1ZOck95S1ZpYVpTYVptR2NZcXhyWm1wZ3BtdGlaSkttbTJSdVlhcHJhbVpvWm1xY1pKeHFuSm9reEhkaDBvVU5GM1pmMkhxeDRjS09DenVsK0M1TUJQSjNYV3krMkFIazcxVVNLa25NSzgzT1RpMXlxRXpNUzBtdDBDc3FkZUtBaVFVSmFwdHJXQm9hYWlxWW1KcnFHcHZxR2hoRVNRQU4zQTAwWWd0USs1NExPNERHN3J1d0NVaTNKNmtZcFNTYm14aWxtT3NtSnhzbjZwcWtHQnJySmlhWm1Pb21tcWVaR1JwYldpWmFXQnAzTURJQkFKck9BQ2pGQUFBQSIsImlzcyI6InR4c2VydmVyIiwia2V5SWQiOiI0ODVlYWEzYy1jYzA0LTRkYmYtOGRlNC03MGJjYzk5ZmVlYjUiLCJmaXJlYmFzZSI6IiIsInNlY3JldHMiOiJoMnpraThSMXkzVDBtWmJSQVY4Z3p3PT0iLCJwcm92aWRlciI6IkZUX0tSQVRPU19DUkVEUyIsInNjb3BlIjoiIiwidHN0ZXAiOiJmYWxzZSIsInNwaW5SZXEiOmZhbHNlLCJleHAiOjE3Nzg5MTk1ODAsInNwaW5FeHAiOiIxNzc4OTE5NzAwIiwianRpIjoiNjMwNGFkNGYtMDM4OC00MWYzLThlZDMtNWZmZTFkYjk3MWMyIn0.gYPovKdgxBC8ncF8RdRhn7ylAvX25yQ2N2BT6YQpovS9bSCjGNNPlM6ZmwBEF9PtoUoIYdZyJhUc18GgoM4pB92ODNcEolyXRXvEwE0vitazu73VTa9wwa1xIpj0y8wH-1Rh4kh03u5PFBz_KxIfCvq9OfVOQKY-FoRijIb_q1Q'
      ),
  };

  return { chartModule: txChartModule, tokenProvider };
}

// ─── Common TxChart config ───

function baseTxChartOptions(
  tokenProvider: TxChartTokenProvider
): TxChartConfigOptions {
  return {
    tokenProvider,
    taHosts: [
      process.env.NEXT_PUBLIC_FINAM_TA_HOSTS || 'https://ftrr01.finam.ru',
    ],
    referenceHosts: [
      process.env.NEXT_PUBLIC_FINAM_REFERENCE_HOSTS ||
        'https://ftrr01.finam.ru',
    ],
    mdHosts: [
      process.env.NEXT_PUBLIC_FINAM_MD_HOSTS || 'https://ftrr01.finam.ru',
    ],
    withDeltas: true,
    tzOffset: 180,
    language: REGION === 'ru' ? 'ru' : 'en',
  };
}

// ─── Regular charts (SBER, Газпром etc) — fresh instance per card ───

export async function createChartInstance(): Promise<TxChartWidgetInstance> {
  const { chartModule, tokenProvider } = await ensureSharedInit();
  const instance = new chartModule.TxChart(baseTxChartOptions(tokenProvider));
  return instance;
}

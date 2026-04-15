'use client';

import { lazy, Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { Agentation } from 'agentation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { MotionProvider } from '@/shared/ui/MotionProvider';
import Notification from '@/shared/ui/Notification';
import CookieBanner from '@/shared/ui/CookieBanner';
import { LocaleProvider } from '@/shared/i18n';
import { useAuthStore } from '@/stores/authStore';
import { currentRegionConfig, REGION } from '@/shared/config/region';
import Script from 'next/script';
import {
  useYandexMetrika,
  METRIKA_SCRIPT_URL,
  getYMId,
} from '@/shared/hooks/useYandexMetrika';
import { parseUtmFromUrl, saveUtmToSession } from '@/shared/utils/utm';
import {
  captureAttributionSessionStart,
  drainAttributionQueueIfAuthenticated,
} from '@/shared/utils/attribution';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((m) => ({
          default: m.ReactQueryDevtools,
        }))
      )
    : () => null;

/**
 * UtmTracker (RU): Yandex Metrika visit params + sessionStorage UTM.
 * AttributionTracker (all regions): localStorage queue, flush on login/signup via POST /api/attribution/events.
 */
/**
 * After SnapTrade OAuth redirect, restore the original page path.
 * SnapTrade redirects to SNAPTRADE_REDIRECT_URL (root),
 * but the user may have started from /portfolio/12.
 */
function SnapTradeReturnRedirect() {
  useEffect(() => {
    const connectionId = localStorage.getItem('snaptrade_connection_id');
    const returnPath = localStorage.getItem('snaptrade_return_path');
    if (connectionId && returnPath && window.location.pathname !== returnPath) {
      localStorage.removeItem('snaptrade_return_path');
      window.location.replace(returnPath);
    }
  }, []);
  return null;
}

function UtmTracker() {
  const { sendVisitParams, setUserId } = useYandexMetrika();
  useEffect(() => {
    const fromUrl = parseUtmFromUrl();
    if (fromUrl) {
      saveUtmToSession(fromUrl);
      sendVisitParams({
        utm_source: fromUrl.utm_source,
        utm_medium: fromUrl.utm_medium,
        utm_campaign: fromUrl.utm_campaign,
        utm_content: fromUrl.utm_content,
        utm_term: fromUrl.utm_term,
        utm_id: fromUrl.utm_id,
        utm_raw: fromUrl.utm_raw,
      });
    }

    const unsub = useAuthStore.subscribe((state, prev) => {
      const userId = state.userId;
      const prevUserId = prev.userId;
      if (userId === prevUserId) return;
      setUserId(userId);
    });

    const userId = useAuthStore.getState().userId;
    if (userId) {
      setUserId(userId);
    }

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function AttributionTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    void drainAttributionQueueIfAuthenticated();
  }, [isAuthenticated, accessToken, pathname, search]);

  useEffect(() => {
    void captureAttributionSessionStart();
  }, [pathname, search]);

  return null;
}

function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <AttributionTrackerInner />
    </Suspense>
  );
}

/**
 * Loads the Yandex Metrika tag.js script and renders a <noscript> pixel
 * fallback. The ym() queue itself is bootstrapped at module level inside
 * useYandexMetrika.ts so it's available before this component mounts.
 */
function YandexMetrikaScript() {
  const ymId = getYMId();
  return (
    <>
      <Script
        id="yandex-metrika-tag"
        src={METRIKA_SCRIPT_URL}
        strategy="afterInteractive"
      />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${ymId}`}
            className="absolute -left-[9999px]"
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}

const brandPrimary = currentRegionConfig.brandPrimaryHex;

const theme = createTheme({
  palette: {
    primary: {
      main: brandPrimary,
    },
    secondary: {
      main: '#6b7280',
    },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 'auto',
        },
      },
    },
  },
});

function makeQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        Sentry.captureException(error, {
          tags: { type: 'mutation_error' },
        });
      },
    }),
    defaultOptions: {
      queries: {
        // Time during which data is considered "fresh"
        staleTime: 1000 * 30, // 30 seconds
        // Cache time
        gcTime: 1000 * 60 * 5, // 5 minutes
        // Retry on errors
        retry: 1,
        // Refetch on window focus
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
    >
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <MotionProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
              <AttributionTracker />
              {REGION === 'ru' && (
                <>
                  <YandexMetrikaScript />
                  <UtmTracker />
                </>
              )}
              <SnapTradeReturnRedirect />
              <Notification />
              <CookieBanner />
              {process.env.NODE_ENV === 'development' && <Agentation />}
            </ThemeProvider>
          </MotionProvider>
        </LocaleProvider>
        {process.env.NODE_ENV === 'development' && (
          <Suspense fallback={null}>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
              position="left"
            />
          </Suspense>
        )}
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

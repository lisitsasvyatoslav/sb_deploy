/**
 * Route configuration for the application
 * Used for navigation and layout detection
 */

/**
 * Layout types for different page categories
 */
export type LayoutType = 'welcome' | 'guest' | 'app' | 'settings';

/**
 * Layout mode - which view modes page supports
 * because some pages are only for flow mode, some are only for grid mode, and some are for both
 */
export type LayoutMode = 'flow' | 'grid' | 'both';

/**
 * Route type - all route information in one place
 */
export type Route = {
  path: string;
  layout: LayoutType; // Layout type: guest (unauth), app (main pages), settings (profile/config)
  showInNav?: boolean; // Show in navigation
  title?: string; // i18n key suffix for nav.* translation (e.g. 'overview' → t('nav.overview'))
  layoutMode?: LayoutMode; // Which view modes page supports (default: 'both')
};

/**
 * All application routes
 * Layout types: welcome (WelcomeLayout), guest (GuestLayout), app (AppLayout), settings (SettingsLayout)
 */
export const ROUTES: Route[] = [
  // Welcome page with demo flow
  { path: '/welcome', layout: 'welcome' },
  { path: '/welcome/:slug', layout: 'welcome' },

  // Guest routes (no auth required) - GuestLayout
  { path: '/login', layout: 'guest' },
  { path: '/register', layout: 'guest' },
  { path: '/forgot-password', layout: 'guest' },
  { path: '/reset-password', layout: 'guest' },
  { path: '/auth/callback', layout: 'guest' },
  { path: '/privacy-policy', layout: 'guest' },
  { path: '/cookie-policy', layout: 'guest' },
  { path: '/terms', layout: 'guest' },
  { path: '/disclaimer', layout: 'guest' },

  // Main app routes (auth required) - AppLayout with chat, news, AI
  {
    path: '/',
    layout: 'app',
    showInNav: true,
    title: 'overview',
    layoutMode: 'both',
  },
  {
    path: '/portfolio',
    layout: 'app',
    showInNav: true,
    title: 'portfolio',
    layoutMode: 'both',
  },
  {
    path: '/portfolio/:id',
    layout: 'app',
    showInNav: false,
    layoutMode: 'flow',
  },
  {
    path: '/strategies',
    layout: 'app',
    showInNav: true,
    title: 'strategies',
    layoutMode: 'both',
  },
  {
    path: '/strategies/:id',
    layout: 'app',
    showInNav: false,
    layoutMode: 'flow',
  },
  {
    path: '/ideas',
    layout: 'app',
    showInNav: true,
    title: 'ideas',
    layoutMode: 'both',
  },
  { path: '/ideas/:id', layout: 'app', showInNav: false, layoutMode: 'flow' },
  { path: '/execute', layout: 'app', showInNav: true, title: 'execution' },
  { path: '/training', layout: 'app', showInNav: true, title: 'training' },

  // Strategy binding (TD-986)
  { path: '/strategies/bound', layout: 'app' },
  { path: '/strategies/bind/callback', layout: 'app' },
  // TODO [MOCK]: Remove mock-comon route after integration with the real comon.ru
  { path: '/strategies/bind/mock-comon', layout: 'app' },

  // Settings routes (auth required) - SettingsLayout without chat
  { path: '/profile', layout: 'settings' },
];

/**
 * Routes for navigation (only routes with showInNav flag)
 */
export const NAV_ROUTES = ROUTES.filter((route) => route.showInNav);

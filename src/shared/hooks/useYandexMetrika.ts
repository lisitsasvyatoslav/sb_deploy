/**
 * useYandexMetrika - hook for tracking events in Yandex Metrika
 *
 * Uses the official ym() queue API. The queue is bootstrapped at module level
 * (runs on first import, before any useEffect). When tag.js is blocked
 * (ad-blockers, tracking protection), calls queue silently — no errors,
 * no retries, app continues normally.
 *
 * Script loading is handled by the YandexMetrikaScript component (rendered
 * in providers.tsx), which loads tag.js via next/script and includes a
 * <noscript> pixel fallback.
 *
 * Usage:
 *   const { trackEvent } = useYandexMetrika();
 *   trackEvent('note_create', { board_id: 1, card_id: 2, card_type: 'note' });
 */

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { isTestingBot } from '@/shared/utils/cookies';
import { logger } from '@/shared/utils/logger';

// ============================================================================
// Types
// ============================================================================

export type YMGoal =
  | 'note_create'
  | 'note_update'
  | 'note_send_to_chat'
  | 'news_drop_to_board'
  | 'board_create'
  | 'note_delete'
  | 'note_drag'
  | 'ticker_search'
  | 'fundamentals_save_to_board'
  | 'technicals_save_to_board'
  | 'fundamentals_send_to_chat'
  | 'technicals_send_to_chat'
  | 'chat_create'
  | 'chat_send_message'
  | 'finam_token_connect'
  | 'snaptrade_portal_connect'
  | 'portfolio_create'
  | 'strategy_create'
  // Explore (news widget) events
  | 'explore_news_loaded'
  | 'explore_empty'
  | 'explore_ai_click'
  | 'explore_bookmark_click'
  | 'explore_scroll_depth'
  | 'explore_time_on_widget'
  // Sparkle events
  | 'sparkle_register_click'
  | 'sparkle_register_success'
  // Onboarding widget lifecycle events
  // Product guide widget (features/onboarding UI)
  | 'onboarding_survey_started'
  | 'onboarding_survey_question_1'
  | 'onboarding_survey_question_2'
  | 'onboarding_survey_question_optional'
  | 'onboarding_survey_continued'
  | 'onboarding_survey_interrupted'
  | 'onboarding_survey_continue_clicked'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_failed'
  // Chat survey gate (distinct from product guide onboarding_started)
  | 'chat_survey_gate_started'
  // Auth, session, chat survey — product-defined reachGoal names / param keys for dashboards
  | 'registration_completed'
  | 'login'
  | 'logout'
  | 'active'
  | 'quiz_required_completed'
  | 'quiz_full_completed'
  | 'quiz_stopped'
  // Broker connection wizard (profile / portfolio)
  | 'broker_connect_started'
  | 'broker_connected'
  | 'broker_connect_failed'
  // Portfolio (catalog + board workspace / positions widget)
  | 'portfolio_opened'
  | 'portfolio_created'
  | 'trades_loaded'
  | 'trade_selected'
  // News + boards + chat (product dashboards)
  | 'news_viewed'
  | 'board_opened'
  | 'board_widget_create'
  | 'ticker_added'
  | 'ai_chat_opened'
  | 'ai_response_received'
  | 'ai_tool_news_activated'
  | 'ai_tool_news_widget_added';

export interface YMNoteCreateParams {
  board_id: number;
  card_id: number;
  card_type: string;
}

export interface YMNoteUpdateParams {
  board_id: number;
  card_id: number;
  card_type: string;
}

export interface YMNoteSendToChatParams {
  board_id: number;
  card_id: number;
  chat_id: number;
}

export interface YMNewsDropToBoardParams {
  board_id: number;
  news_id: string;
  ticker?: string;
  x: number;
  y: number;
}

export interface YMBoardCreateParams {
  board_id: number;
}

export interface YMNoteDeleteParams {
  board_id: number;
  card_id: number;
}

export interface YMNoteDragParams {
  board_id: number;
  card_id: number;
  x: number;
  y: number;
}

export interface YMTickerSearchParams {
  query: string;
  market?: string;
  type?: string;
  ticker?: string;
}

export interface YMFundamentalsSaveToBoardParams {
  board_id: number;
  security_id: number;
  ticker: string;
}

export interface YMTechnicalsSaveToBoardParams {
  board_id: number;
  security_id: number;
  ticker: string;
}

export interface YMFundamentalsSendToChatParams {
  chat_id: number;
  security_id: number;
  ticker: string;
}

export interface YMTechnicalsSendToChatParams {
  chat_id: number;
  security_id: number;
  ticker: string;
}

export interface YMChatCreateParams {
  chat_id: number;
}

export interface YMChatSendMessageParams {
  chat_id: number;
  length: number;
}

export interface YMFinamTokenConnectParams {
  status: 'success' | 'error';
  accounts_found?: number;
}

export interface YMSparkleRegisterClickParams {
  dialog_id?: string;
  questions_answered?: number;
}

export interface YMSparkleRegisterSuccessParams {
  dialog_id?: string;
  questions_answered?: number;
}

// Onboarding survey param interfaces
export type YMOnboardingSurveyStartedParams = Record<string, never>;
/** Chat in-app survey gate opens (required questions flow). */
export type YMChatSurveyGateStartedParams = Record<string, never>;

/** Product onboarding guide panel is shown (started_time = first open this session). */
export interface YMOnboardingGuideStartedParams {
  started_time: string;
}

/** User finished the last scene of the product onboarding guide. */
export interface YMOnboardingGuideCompletedParams {
  completed_time: string;
}

/** User closed the guide early (X) while onboarding was still active on the server. */
export interface YMOnboardingGuideFailedParams {
  failed_time: string;
  /** Progress string e.g. "42%" for dashboards */
  last_stage: string;
}

export interface YMOnboardingSurveyQuestionParams {
  question_id: number;
  answer: string[];
  question_type: 'required' | 'optional';
  question_number?: number;
  total_answered: number;
  required_answered: number;
  optional_answered: number;
  remaining_questions?: number;
}

export interface YMOnboardingSurveyContinuedParams {
  choice: 'all' | 'three';
  required_answered: number;
}

export interface YMOnboardingSurveyInterruptedParams {
  phase: 'prompt' | 'optional' | 'reminder';
  questions_answered: number;
  required_answered: number;
  optional_answered: number;
}

export interface YMOnboardingSurveyContinueClickedParams {
  from_reminder: boolean;
  remaining_questions?: number;
}

// Onboarding widget lifecycle param interfaces
export interface YMOnboardingStartedParams {
  started_time: string;
}

export interface YMOnboardingCompletedParams {
  completed_time: string;
}

export interface YMOnboardingFailedParams {
  failed_time: string;
  last_stage: string;
}

export interface YMExploreNewsLoadedParams {
  board_id: number;
  count: number;
}

export interface YMExploreEmptyParams {
  board_id: number;
}

export interface YMExploreAIClickParams {
  board_id: number;
  news_id: string;
  ticker?: string;
}

export interface YMExploreBookmarkClickParams {
  board_id: number;
  news_id: string;
  ticker?: string;
}

export interface YMExploreScrollDepthParams {
  board_id: number;
  depth_percent: 25 | 50 | 75 | 100;
}

export interface YMExploreTimeOnWidgetParams {
  board_id: number;
  seconds: number;
}

/** Shared login / register / logout payload: explore = news sidebar, chat = chat sidebar. */
export interface YMAuthSidebarEngagementParams {
  explore: 'on' | 'off';
  chat: 'on' | 'off';
}

/** Logout goal: session_closed is ISO timestamp at sign-out. */
export interface YMLogoutEngagementParams extends YMAuthSidebarEngagementParams {
  session_closed: string;
}

/** Once-per-tab-session goal: session_started + optional registration_date / retention from client storage. */
export interface YMActiveEngagementParams extends YMAuthSidebarEngagementParams {
  session_started: string;
  registration_date?: string;
  retention?: number;
  device: 'desktop' | 'mobile';
}

/** All required survey answers submitted; started_time = first blocked question shown (funnel start). */
export interface YMQuizRequiredCompletedParams {
  started_time: string;
}

/** Extended / optional survey finished successfully (not skip / "later"). */
export interface YMQuizFullCompletedParams {
  completed_time: string;
}

/** User skipped survey or chose "later"; last_question is progress as percent string. */
export interface YMQuizStoppedParams {
  failed_time: string;
  last_question: string;
}

/** User opened the broker connection modal (any entry: FAB, profile, portfolio auto-open, SnapTrade return). */
export type YMBrokerConnectStartedParams = Record<string, never>;

/** Full wizard completed: sync settings saved and modal closed successfully. */
export interface YMBrokerConnectedParams {
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

/** Invalid token / portal error / closing without success — broker_name from selection or none. */
export interface YMBrokerConnectFailedParams {
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

/**
 * Opened portfolio workspace board (`/portfolio/:id`). `portfolio_id` is the board id from the route.
 * `broker_name` comes from the board-linked catalog portfolio `fillRule` (type `broker` → Finam/ByBit/KuCoin);
 * no link, non-broker fill rule, or failed load → `none`.
 */
export interface YMPortfolioOpenedParams {
  portfolio_id: number;
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

/** Created instrument portfolio entity (API); broker_name from fill_rule when type broker. */
export interface YMPortfolioCreatedParams {
  portfolio_id: number;
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

/**
 * Broker statistics data loaded: flat table → paginated trades query; grouped table → grouped positions query
 * (one event per filter/page change, not per expanded instrument). portfolio_id 0 = no catalog filter.
 */
export interface YMTradesLoadedParams {
  portfolio_id: number;
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

/** User selected trade(s) in grouped or flat history table; portfolio_id 0 = no catalog filter. */
export interface YMTradeSelectedParams {
  portfolio_id: number;
  broker_name: 'Finam' | 'ByBit' | 'KuCoin' | 'none';
}

export interface YMNewsViewedParams {
  news_id: string;
}

export interface YMBoardOpenedParams {
  board_id: number;
  board_type: 'portfolio' | 'space' | 'strategy';
}

export interface YMBoardWidgetCreateParams {
  board_id: number;
  board_type: 'portfolio' | 'space' | 'strategy';
  widget_type: 'news' | 'ticker' | 'strategy';
}

/** Comma-separated ticker symbols (ideas / infinite canvas). */
export interface YMTickerAddedParams {
  board_id: number;
  board_type: 'portfolio' | 'space' | 'strategy';
  tickers: string;
}

export interface YMAiChatOpenedParams {
  chat_id: number;
}

export interface YMAiResponseReceivedParams {
  chat_id: number;
  length: number;
}

export interface YMAiToolNewsActivatedParams {
  chat_id: number;
}

export interface YMAiToolNewsWidgetAddedParams {
  chat_id: number;
  board_id: number;
}

export type YMEventParams =
  | YMNoteCreateParams
  | YMNoteUpdateParams
  | YMNoteSendToChatParams
  | YMNewsDropToBoardParams
  | YMBoardCreateParams
  | YMNoteDeleteParams
  | YMNoteDragParams
  | YMTickerSearchParams
  | YMFundamentalsSaveToBoardParams
  | YMTechnicalsSaveToBoardParams
  | YMFundamentalsSendToChatParams
  | YMTechnicalsSendToChatParams
  | YMChatCreateParams
  | YMChatSendMessageParams
  | YMFinamTokenConnectParams
  | YMSparkleRegisterClickParams
  | YMSparkleRegisterSuccessParams
  | YMOnboardingSurveyStartedParams
  | YMOnboardingSurveyQuestionParams
  | YMOnboardingSurveyContinuedParams
  | YMOnboardingSurveyInterruptedParams
  | YMOnboardingSurveyContinueClickedParams
  | YMChatSurveyGateStartedParams
  | YMOnboardingGuideStartedParams
  | YMOnboardingGuideCompletedParams
  | YMOnboardingGuideFailedParams
  | YMOnboardingCompletedParams
  | YMOnboardingFailedParams
  | YMExploreNewsLoadedParams
  | YMExploreEmptyParams
  | YMExploreAIClickParams
  | YMExploreBookmarkClickParams
  | YMExploreScrollDepthParams
  | YMExploreTimeOnWidgetParams
  | YMAuthSidebarEngagementParams
  | YMLogoutEngagementParams
  | YMActiveEngagementParams
  | YMQuizRequiredCompletedParams
  | YMQuizFullCompletedParams
  | YMQuizStoppedParams
  | YMBrokerConnectStartedParams
  | YMBrokerConnectedParams
  | YMBrokerConnectFailedParams
  | YMPortfolioOpenedParams
  | YMPortfolioCreatedParams
  | YMTradesLoadedParams
  | YMTradeSelectedParams
  | YMNewsViewedParams
  | YMBoardOpenedParams
  | YMBoardWidgetCreateParams
  | YMTickerAddedParams
  | YMAiChatOpenedParams
  | YMAiResponseReceivedParams
  | YMAiToolNewsActivatedParams
  | YMAiToolNewsWidgetAddedParams;

// ============================================================================
// Global window extension for ym() queue
// ============================================================================

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
  }
}

// ============================================================================
// Module-level queue bootstrap
// Runs once on first import, before any useEffect.
// ============================================================================

if (typeof window !== 'undefined' && typeof window.ym !== 'function') {
  type YmQueue = ((...args: unknown[]) => void) & {
    a?: unknown[][];
    l?: number;
  };
  const ym: YmQueue = Object.assign(
    (...args: unknown[]) => {
      (ym.a = ym.a || []).push(args);
    },
    { a: [] as unknown[][], l: Number(new Date()) }
  );
  window.ym = ym;
}

// ============================================================================
// Core: ym() wrapper
// ============================================================================

const METRIKA_SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js';

/**
 * Get Yandex Metrika ID from environment or use default
 */
function getYMId(): number {
  const ymId = process.env.NEXT_PUBLIC_YM_ID;
  if (ymId) {
    const parsed = parseInt(ymId, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return 12345678;
}

/**
 * Call ym() queue if available. The queue is bootstrapped in layout.tsx via
 * an inline script that runs before hydration. If ym() is not defined (US
 * region, SSR, or something unexpected), calls are silently ignored.
 */
function callYm(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  if (typeof window.ym === 'function') {
    window.ym(...args);
  }
}

// ============================================================================
// Initialization
// ============================================================================

let isInitialized = false;

/**
 * Initialize Yandex Metrika counter via ym() queue
 */
function initializeYandexMetrika(): void {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;
  if (isTestingBot()) return;

  const ymId = getYMId();

  callYm(ymId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer',
  });

  isInitialized = true;

  if (process.env.NODE_ENV === 'development') {
    logger.debug('YandexMetrika', `Initialized with counter ID: ${ymId}`);
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for tracking Yandex Metrika events.
 * Uses the official ym() queue API — resilient to ad-blockers (silent no-op
 * when tag.js is blocked instead of error cascade).
 */
export const useYandexMetrika = () => {
  useEffect(() => {
    initializeYandexMetrika();
  }, []);

  /**
   * Track an event with Yandex Metrika
   * @param goal - Event goal name
   * @param params - Event parameters (user_id is added automatically)
   * Stable identity (empty deps) — safe to list in useEffect dependency arrays.
   */
  const trackEvent = useCallback((goal: YMGoal, params?: YMEventParams) => {
    if (isTestingBot()) return;
    const ymId = getYMId();
    const userId = useAuthStore.getState().userId;

    const eventParams: Record<string, unknown> = {
      ...params,
      user_id: userId || 'anonymous',
    };

    callYm(ymId, 'reachGoal', goal, eventParams);

    if (process.env.NODE_ENV === 'development') {
      logger.debug('YandexMetrika', `Event tracked: ${goal}`, eventParams);
    }
  }, []);

  /**
   * Bind a user identity to Yandex Metrika sessions.
   * Call with the user's identifier on login, with null on logout.
   */
  const setUserId = useCallback((userId: string | null) => {
    if (isTestingBot()) return;
    const ymId = getYMId();
    callYm(ymId, 'setUserID', userId || '');
    if (process.env.NODE_ENV === 'development') {
      logger.debug('YandexMetrika', `setUserID: ${userId ?? 'cleared'}`);
    }
  }, []);

  /**
   * Send visit-level parameters to Yandex Metrika.
   * Use for UTM attribution and other session metadata — calls ym.params(),
   * not reachGoal, so data appears in visit parameters, not as a goal event.
   */
  const sendVisitParams = useCallback((params: Record<string, unknown>) => {
    if (isTestingBot()) return;
    const ymId = getYMId();
    callYm(ymId, 'params', params);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('YandexMetrika', 'Visit params sent', params);
    }
  }, []);

  return { trackEvent, setUserId, sendVisitParams };
};

/**
 * Standalone function for tracking events outside React components.
 * Will auto-initialize if not already initialized.
 * Automatically adds user_id from auth store if not provided.
 */
export const trackYMEvent = (
  goal: YMGoal,
  params?: YMEventParams & { user_id?: string }
): void => {
  if (isTestingBot()) return;
  initializeYandexMetrika();

  const ymId = getYMId();
  const userId = useAuthStore.getState().userId;
  const eventParams: Record<string, unknown> = {
    ...params,
    user_id: params?.user_id ?? (userId || 'anonymous'),
  };

  callYm(ymId, 'reachGoal', goal, eventParams);

  if (process.env.NODE_ENV === 'development') {
    logger.debug('YandexMetrika', `Event tracked: ${goal}`, eventParams);
  }
};

export { METRIKA_SCRIPT_URL, getYMId };

export default useYandexMetrika;

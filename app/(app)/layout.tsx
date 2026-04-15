'use client';

import NewsSidebar from '@/features/news';
import Sidebar from '@/features/sidebar';
import { Loading } from '@/shared/ui/Loading';
import AddBrokerDialog from '@/features/broker/components/AddBrokerDialog';
import BrokerManagementDialog from '@/features/broker/components/BrokerManagementDialog';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { ChatManager } from '@/features/chat/components/ChatManager';
import {
  OnboardingFAB,
  OnboardingOverlay,
  OnboardingWidget,
  useOnboardingAutoMode,
  useOnboardingGuideYmOpen,
  useOnboardingProgress,
  useOnboardingProgressSync,
  useOnboardingUIStore,
  useOnboardingUIStoreHydrated,
  useGlowTarget,
  GlowBorder,
} from '@/features/onboarding';
import SignalModal from '@/features/signal/components/SignalModal';
import AddNewsAnalyticsModal from '@/features/ticker/components/AddNewsAnalyticsModal';
import TickerInfoModal from '@/features/ticker/components/TickerInfoModal';
import TickerPickerModal from '@/features/ticker/components/TickerPickerModal';
import NewsPreviewModal from '@/features/news/components/NewsPreviewModal';
import { useViewStore } from '@/stores/appViewStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import {
  useProactiveTokenRefresh,
  useWelcomeFlowHandler,
} from '@/shared/hooks';
import { useSignalSSE } from '@/shared/hooks/useSignalSSE';
import { useCallback, useEffect, useRef } from 'react';
import {
  DOCKED_MIN_WIDTH,
  DOCKED_MAX_WIDTH,
  ONBOARDING_SCENES,
} from '@/features/onboarding/constants';

// Highlight targets that map to elements rendered inside the main content
// area. Hoisted to module scope so the array reference is stable across
// renders (the inline literal would allocate a new array each render).
const CONTENT_AREA_HIGHLIGHT_TARGETS = [
  'board',
  'board-or-create',
  'board-toolbar',
  'add-ticker',
  'ticker-add-button',
  'portfolio-containers',
];

/**
 * App Layout - for authenticated pages with full functionality
 * New structure: Sidebar | NewsSidebar? | ChatManager? | MainContent
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, restoreAuth } = useAuthStore();
  const setContainerWidth = useViewStore((state) => state.setContainerWidth);
  const showBrokerManagementDialog = useStatisticsStore(
    (state) => state.showBrokerManagementDialog
  );
  const setShowBrokerManagementDialog = useStatisticsStore(
    (state) => state.setShowBrokerManagementDialog
  );
  const openGuide = useOnboardingUIStore((s) => s.openGuide);
  const isGuideOpen = useOnboardingUIStore((s) => s.isGuideOpen);
  const widgetMode = useOnboardingUIStore((s) => s.widgetMode);
  const dockedWidth = useOnboardingUIStore((s) => s.dockedWidth);
  const setDockedWidth = useOnboardingUIStore((s) => s.setDockedWidth);
  const isChatOpen = useChatStore(
    (s) => s.isChatSidebarOpen || s.activeChatId !== null
  );
  // Only activate the chat GlowBorder when the chat is actually open —
  // otherwise the wrapper's 0-width rect produces a thin strip cutout
  // between the sidebar and the chat area.
  const chatGlowActive = useGlowTarget('chat') && isChatOpen;
  const activeSceneIndex = useOnboardingUIStore((s) => s.activeSceneIndex);
  const { isActive: isOnboardingActive } = useOnboardingProgress();
  // Wait for the persisted onboarding UI state to load before running any
  // effect that might write to it — otherwise we'd race the rehydration
  // and either resurrect a manually-closed widget or corrupt widgetMode.
  const onboardingHydrated = useOnboardingUIStoreHydrated();

  // Keep the main content area visible when board-related targets are active
  const contentAreaHighlighted = useGlowTarget(CONTENT_AREA_HIGHLIGHT_TARGETS);

  // Auto-open onboarding widget for new users or after restart.
  // Gated on hydration so we don't openGuide() on top of stale defaults
  // and then get overwritten when localStorage finally loads.
  useEffect(() => {
    if (!onboardingHydrated) return;
    if (isOnboardingActive && !isGuideOpen) {
      openGuide();
    }
  }, [isOnboardingActive, onboardingHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bidirectional sync between the server-side onboarding progress and the
  // local Zustand store. Hydrates the store on mount and write-throughs any
  // local mutations of checkedSteps / activeSceneIndex / surveyCompleted.
  useOnboardingProgressSync();

  // Auto-close chat when onboarding moves to a non-chat scene (board, portfolio)
  useEffect(() => {
    if (!isGuideOpen) return;
    const scene = ONBOARDING_SCENES[activeSceneIndex];
    if (scene && scene.highlightTarget !== 'chat') {
      useChatStore.getState().closeAll();
    }
  }, [activeSceneIndex, isGuideOpen]);

  // Auto-switch docked/floating based on current route
  useOnboardingAutoMode();
  useOnboardingGuideYmOpen();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Handle post-auth welcome flow (creates seeded chat + card after signup)
  useWelcomeFlowHandler();

  // Connect to SSE for real-time signal updates
  useSignalSSE();

  // Proactively refresh access token before it expires
  useProactiveTokenRefresh();

  // Restore auth on mount
  useEffect(() => {
    restoreAuth(true);
  }, [restoreAuth]);

  // Measure content container width and update store
  const measureWidth = useCallback(() => {
    if (!contentRef.current) return;
    const width = contentRef.current.offsetWidth;
    setContainerWidth(width);
  }, [setContainerWidth]);

  // Measure content container width and update store
  useEffect(() => {
    if (!contentRef.current || typeof window === 'undefined') return;

    measureWidth();

    observerRef.current = new ResizeObserver(() => {
      measureWidth();
    });

    observerRef.current.observe(contentRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [measureWidth]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthGuard>
      <div
        className="App h-screen flex"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        {/* Onboarding backdrop — dims layout, highlights active GlowBorder target */}
        <OnboardingOverlay />

        {/* Left navigation sidebar - always visible */}
        <Sidebar />

        {/* Expandable panels area */}
        <div className="flex h-full flex-shrink-0">
          {/* AI Chat panel — wrapped with animated glow border for onboarding */}
          <GlowBorder
            active={chatGlowActive}
            className="flex flex-shrink-0 h-full overflow-hidden"
          >
            <ChatManager />
          </GlowBorder>

          {/* Explore panel */}
          <NewsSidebar />
        </div>

        {/* Main content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-auto bg-[var(--bg-base)] relative flex min-w-0"
        >
          {/* Page content — always rendered */}
          <div
            data-glow-container
            data-glow-active={contentAreaHighlighted || undefined}
            className="flex-1 overflow-auto relative min-w-0"
          >
            {children}
            {/* Permanent "?" FAB — hidden when guide is open */}
            {!isGuideOpen && <OnboardingFAB onClick={openGuide} />}
          </div>

          {/* Onboarding widget — single mount point to preserve state
              across mode switches and navigation. In docked mode the
              wrapper participates in flex layout; in floating mode it
              collapses to 0×0 with overflow-visible so the widget's
              internal position:fixed rendering floats above the page. */}
          {isGuideOpen && (
            <div
              className={`relative z-[1400] ${
                widgetMode === 'docked'
                  ? 'shrink-0 h-full'
                  : 'w-0 h-0 overflow-visible'
              }`}
              style={
                widgetMode === 'docked' ? { width: dockedWidth } : undefined
              }
            >
              {/* Left-edge resize handle (docked only) */}
              {widgetMode === 'docked' && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-[1401] hover:bg-blackinverse-a8 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startW = dockedWidth;
                    const onMove = (ev: MouseEvent) => {
                      const dx = ev.clientX - startX;
                      const w = Math.min(
                        DOCKED_MAX_WIDTH,
                        Math.max(DOCKED_MIN_WIDTH, startW - dx)
                      );
                      setDockedWidth(w);
                    };
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                />
              )}
              <OnboardingWidget />
            </div>
          )}
        </div>

        {/* Modals */}
        <TickerPickerModal />
        <TickerInfoModal />
        <AddNewsAnalyticsModal />
        <NewsPreviewModal />
        <SignalModal />
        <AddBrokerDialog />
        <BrokerManagementDialog
          open={showBrokerManagementDialog}
          onClose={() => setShowBrokerManagementDialog(false)}
        />
      </div>
    </AuthGuard>
  );
}

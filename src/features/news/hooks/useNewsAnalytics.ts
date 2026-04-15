import { useCallback, useRef, useEffect } from 'react';
import { useYandexMetrika } from '@/shared/hooks';

interface UseNewsAnalyticsParams {
  boardId: number | null;
  isOpen: boolean;
  isLoading: boolean;
  feedItemsLength: number;
  hasMore: boolean;
  loadMore: () => void;
}

export function useNewsAnalytics({
  boardId,
  isOpen,
  isLoading,
  feedItemsLength,
  hasMore,
  loadMore,
}: UseNewsAnalyticsParams) {
  const { trackEvent } = useYandexMetrika();

  // Scroll depth tracking
  const scrolledDepthsRef = useRef<Set<number>>(new Set());
  const resetScrollDepths = useCallback(() => {
    scrolledDepthsRef.current = new Set();
  }, []);

  // Widget enter/leave time tracking
  const widgetEnterTimeRef = useRef<number | null>(null);

  const handleWidgetMouseEnter = useCallback(() => {
    widgetEnterTimeRef.current = Date.now();
  }, []);

  const handleWidgetMouseLeave = useCallback(() => {
    if (widgetEnterTimeRef.current === null) return;
    const seconds = Math.round(
      (Date.now() - widgetEnterTimeRef.current) / 1000
    );
    widgetEnterTimeRef.current = null;
    if (seconds > 0) {
      trackEvent('explore_time_on_widget', { board_id: boardId || 0, seconds });
    }
  }, [boardId, trackEvent]);

  useEffect(() => {
    if (!isOpen) handleWidgetMouseLeave();
  }, [isOpen, handleWidgetMouseLeave]);

  // Feed loaded/empty tracking
  const handleFeedLoaded = useCallback(
    (count: number) => {
      resetScrollDepths();
      trackEvent('explore_news_loaded', { board_id: boardId || 0, count });
    },
    [boardId, trackEvent, resetScrollDepths]
  );

  const handleFeedEmpty = useCallback(() => {
    resetScrollDepths();
    trackEvent('explore_empty', { board_id: boardId || 0 });
  }, [boardId, trackEvent, resetScrollDepths]);

  const wasEmptyBeforeLoadRef = useRef(true);
  useEffect(() => {
    if (!isLoading) {
      if (wasEmptyBeforeLoadRef.current) {
        wasEmptyBeforeLoadRef.current = false;
        if (feedItemsLength > 0) {
          handleFeedLoaded(feedItemsLength);
        } else {
          handleFeedEmpty();
        }
      }
    } else if (feedItemsLength === 0) {
      wasEmptyBeforeLoadRef.current = true;
    }
  }, [isLoading, feedItemsLength, handleFeedLoaded, handleFeedEmpty]);

  // Scroll handler (milestone + infinite load trigger)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable > 0) {
        const percent = Math.round((el.scrollTop / scrollable) * 100);
        ([25, 50, 75, 100] as const).forEach((milestone) => {
          if (
            percent >= milestone &&
            !scrolledDepthsRef.current.has(milestone)
          ) {
            scrolledDepthsRef.current.add(milestone);
            trackEvent('explore_scroll_depth', {
              board_id: boardId || 0,
              depth_percent: milestone,
            });
          }
        });
      }
      if (
        hasMore &&
        !isLoading &&
        el.scrollHeight - el.scrollTop - el.clientHeight < 300
      ) {
        loadMore();
      }
    },
    [boardId, trackEvent, hasMore, isLoading, loadMore]
  );

  return {
    handleWidgetMouseEnter,
    handleWidgetMouseLeave,
    handleScroll,
  };
}

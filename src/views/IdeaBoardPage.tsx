'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTranslation } from '@/shared/i18n/client';
import { Board } from '@/features/board/components/Board';

import BottomNavigationMenu from '@/shared/ui/BottomNavigationMenu';
import type { SignalSourceType } from '@/features/board/components/SignalWidgetCatalog';
import { useBoardQuery, useCreateCardMutation } from '@/features/board/queries';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useSignalModalStore } from '@/features/signal/stores/signalModalStore';
import { useHotkeys, useYandexMetrika } from '@/shared/hooks';
import { useNewsFeedConfigStore } from '@/stores/newsFeedConfigStore';
import {
  getViewportCenter,
  DEFAULT_VIEWPORT,
} from '@/features/board/utils/viewportUtils';
import { currentBoard } from '@/services/api/client';
import { useBoardStore } from '@/stores/boardStore';
import { useChatStore } from '@/stores/chatStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import {
  useBoardPortfolioSettingsQuery,
  usePortfolioDetailQuery,
} from '@/features/portfolio-catalog/queries';
import { logger } from '@/shared/utils/logger';
import type { CardType } from '@/types/common';
import { showInfoToast } from '@/shared/utils/toast';
import {
  ymBoardTypeFromPathname,
  ymBoardTypeFromTemplate,
  type YmBoardType,
} from '@/features/board/utils/ymBoardType';
import type { YmAnalyticsBrokerName } from '@/features/broker/utils/ymBrokerName';
import { ymBrokerNameFromPortfolioFillRule } from '@/features/portfolio-catalog/utils/ymPortfolioAnalytics';

const NEWS_FEED_CARD_WIDTH = 380;
const NEWS_FEED_CARD_HEIGHT = 520;

interface IdeaBoardPageContentProps {
  boardId: number;
  highlightCardId?: number;
  /** True when URL is `/portfolio/:id` (portfolio workspace board). */
  isPortfolioBoardRoute?: boolean;
  /** Route-derived board kind for YM `board_opened`. */
  ymRouteBoardType: YmBoardType;
}

function IdeaBoardPageContent({
  boardId,
  highlightCardId,
  isPortfolioBoardRoute = false,
  ymRouteBoardType,
}: IdeaBoardPageContentProps) {
  const { t } = useTranslation('board');
  const { t: tCommon } = useTranslation('common');
  const { data: board, isLoading } = useBoardQuery(boardId);
  const { setBoardId, showMiniMap, toggleMiniMap, viewport } = useBoardStore();
  const isChatExpanded = useChatStore((s) => s.isChatExpanded);
  const { openModal: openTickerModal } = useTickerModalStore();
  const { openModal: openSignalModal } = useSignalModalStore();
  const { openConfig } = useNewsFeedConfigStore();
  const createCardMutation = useCreateCardMutation();
  const { trackEvent } = useYandexMetrika();
  const portfolioOpenedKeyRef = useRef<string | null>(null);
  const boardOpenedKeyRef = useRef<string | null>(null);

  const { data: boardPortfolioSettings, status: boardPortfolioSettingsStatus } =
    useBoardPortfolioSettingsQuery(boardId);

  const linkedCatalogPortfolioId =
    boardPortfolioSettingsStatus === 'success' &&
    boardPortfolioSettings?.portfolioId != null
      ? boardPortfolioSettings.portfolioId
      : null;

  const { data: linkedPortfolio, status: linkedPortfolioStatus } =
    usePortfolioDetailQuery(
      linkedCatalogPortfolioId,
      isPortfolioBoardRoute && linkedCatalogPortfolioId != null
    );

  useEffect(() => {
    if (!isPortfolioBoardRoute) {
      portfolioOpenedKeyRef.current = null;
      return;
    }
    if (boardPortfolioSettingsStatus === 'pending') return;

    let broker_name: YmAnalyticsBrokerName = 'none';
    if (boardPortfolioSettingsStatus === 'success' && boardPortfolioSettings) {
      if (boardPortfolioSettings.portfolioId != null) {
        if (linkedPortfolioStatus === 'pending') return;
        if (linkedPortfolioStatus === 'success' && linkedPortfolio) {
          broker_name = ymBrokerNameFromPortfolioFillRule(
            linkedPortfolio.fillRule
          );
        }
      }
    }

    const key = String(boardId);
    if (portfolioOpenedKeyRef.current === key) return;
    portfolioOpenedKeyRef.current = key;
    trackEvent('portfolio_opened', {
      portfolio_id: boardId,
      broker_name,
    });
  }, [
    isPortfolioBoardRoute,
    boardId,
    boardPortfolioSettings,
    boardPortfolioSettingsStatus,
    linkedPortfolio,
    linkedPortfolioStatus,
    trackEvent,
  ]);

  useEffect(() => {
    const key = `${boardId}:${ymRouteBoardType}`;
    if (boardOpenedKeyRef.current === key) return;
    boardOpenedKeyRef.current = key;
    trackEvent('board_opened', {
      board_id: boardId,
      board_type: ymRouteBoardType,
    });
  }, [boardId, ymRouteBoardType, trackEvent]);

  // Suppress the browser context menu immediately on page mount,
  // before board data loads and the Board component renders (where the main handler lives).
  // Without this, right-clicking during load would show the native browser menu.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement | null;
      if (!el?.closest('input, textarea, [contenteditable="true"]')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handler, true);
    return () => document.removeEventListener('contextmenu', handler, true);
  }, []);

  const setSelectedPortfolioId = useStatisticsStore(
    (state) => state.setSelectedPortfolioId
  );
  const setSelectedPortfolioName = useStatisticsStore(
    (state) => state.setSelectedPortfolioName
  );

  // Set the active board ID in both localStorage and boardStore when it changes
  useEffect(() => {
    currentBoard.setId(boardId);
    setBoardId(boardId);
  }, [boardId, setBoardId]);

  // Restore selected portfolio from board_portfolio_settings (same query as YM context).
  useEffect(() => {
    if (boardPortfolioSettingsStatus === 'success' && boardPortfolioSettings) {
      setSelectedPortfolioId(boardPortfolioSettings.portfolioId);
      setSelectedPortfolioName(boardPortfolioSettings.portfolioName);
    }
    if (boardPortfolioSettingsStatus === 'error') {
      setSelectedPortfolioId(null);
      setSelectedPortfolioName(null);
    }
  }, [
    boardPortfolioSettings,
    boardPortfolioSettingsStatus,
    setSelectedPortfolioId,
    setSelectedPortfolioName,
  ]);

  const handleOpenCreateDialog = useCallback(() => {
    // Dispatch event that useBoard listens to - opens CreateCardDialog
    window.dispatchEvent(new Event('createNote'));
  }, []);

  // Create an empty news feed card and immediately open inline config
  const handleAddNewsWidget = useCallback(async () => {
    try {
      const viewportCenter = getViewportCenter(viewport || DEFAULT_VIEWPORT);
      const card = await createCardMutation.mutateAsync({
        boardId,
        title: tCommon('newsWidgetModal.cardTitle'),
        content: '',
        type: 'widget',
        x: viewportCenter.x,
        y: viewportCenter.y,
        zIndex: 1,
        width: NEWS_FEED_CARD_WIDTH,
        height: NEWS_FEED_CARD_HEIGHT,
        meta: { widgetType: 'news_feed', newsFilters: [], newsTickers: [] },
      });
      trackEvent('board_widget_create', {
        board_id: boardId,
        board_type: ymBoardTypeFromTemplate(board?.template),
        widget_type: 'news',
      });
      openConfig(card.id);
    } catch (error) {
      logger.error('IdeaBoardPage', 'Failed to create news feed card', error);
    }
  }, [
    boardId,
    board?.template,
    viewport,
    createCardMutation,
    openConfig,
    tCommon,
    trackEvent,
  ]);

  const handleSignalSelect = useCallback(
    (signalType: SignalSourceType) => {
      switch (signalType) {
        case 'telegram':
          showInfoToast(t('toast.telegramComingSoon'));
          break;
        case 'tradingview':
          openSignalModal(boardId);
          break;
        case 'ai_screener':
          window.dispatchEvent(new Event('createAiScreener'));
          break;
      }
    },
    [t, boardId, openSignalModal]
  );

  const handleToggleStrategyCatalog = useCallback(() => {
    window.dispatchEvent(new Event('toggleStrategyCatalog'));
  }, []);

  const handleToggleSignalCatalog = useCallback(() => {
    window.dispatchEvent(new Event('toggleSignalCatalog'));
  }, []);

  // Strategy board toolbar stubs
  const handleSelectionModeClick = useCallback(() => {
    showInfoToast(t('toast.selectionModePressed'));
  }, [t]);

  const handleStrategyWidgetSelect = useCallback((widgetType: CardType) => {
    window.dispatchEvent(
      new CustomEvent('createStrategyWidget', { detail: { widgetType } })
    );
  }, []);

  // Hotkeys
  const hotkeyBindings = useMemo(
    () => [
      { key: 'v', handler: handleSelectionModeClick },
      { key: 'n', handler: handleOpenCreateDialog },
      { key: 's', handler: handleToggleStrategyCatalog },
      { key: 'k', handler: handleToggleSignalCatalog },
      { key: 't', handler: openTickerModal },
      { key: 'm', handler: toggleMiniMap },
    ],
    [
      toggleMiniMap,
      handleSelectionModeClick,
      handleOpenCreateDialog,
      handleToggleStrategyCatalog,
      handleToggleSignalCatalog,
      openTickerModal,
      t,
    ]
  );
  useHotkeys(hotkeyBindings);

  if (isLoading) {
    return (
      <div className="w-full h-full relative bg-surface-base">
        <div className="flex justify-center items-center h-full">
          <p className="theme-text-primary">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="w-full h-full relative bg-surface-base">
        <div className="flex justify-center items-center h-full">
          <p className="theme-text-primary">{t('boardNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" tabIndex={0}>
      <Board boardId={boardId} highlightCardId={highlightCardId} />
      {!isChatExpanded && (
        <BottomNavigationMenu
          onSelectionModeClick={handleSelectionModeClick}
          onSignalSelect={handleSignalSelect}
          onDocumentClick={handleOpenCreateDialog}
          onMagnifierClick={openTickerModal}
          onNewsWidgetClick={handleAddNewsWidget}
          showMiniMap={showMiniMap}
          onMiniMapClick={toggleMiniMap}
          onStrategyWidgetSelect={handleStrategyWidgetSelect}
        />
      )}
    </div>
  );
}

export default function IdeaBoardPage() {
  const { t } = useTranslation('board');
  const pathname = usePathname();
  const isPortfolioBoardRoute = pathname?.startsWith('/portfolio/') ?? false;
  const ymRouteBoardType = ymBoardTypeFromPathname(pathname ?? null);
  const params = useParams<{ id: string }>();
  const boardId = params?.id ? parseInt(params.id, 10) : null;

  if (!boardId) {
    return (
      <div className="w-full h-full relative bg-surface-base">
        <div className="flex justify-center items-center h-full">
          <p className="theme-text-primary">{t('boardIdNotSpecified')}</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <IdeaBoardPageContent
        boardId={boardId}
        isPortfolioBoardRoute={isPortfolioBoardRoute}
        ymRouteBoardType={ymRouteBoardType}
      />
    </ReactFlowProvider>
  );
}

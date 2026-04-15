import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/shared/ui/Modal';
import {
  DEFAULT_VIEWPORT,
  getBoardCenterWithoutInstance,
} from '@/features/board/utils/viewportUtils';
import { useCreateTickerCards } from '@/features/ticker/hooks/useCreateTickerCards';
import {
  useAnalyticsTabsQuery,
  useFundamentalDataByTickersQuery,
  useNewsByTickersQuery,
  useTechnicalDataByTickersQuery,
  useTickersQuery,
} from '@/features/ticker/queries';
import { useNewsAnalyticsModalStore } from '@/features/ticker/stores/newsAnalyticsModalStore';
import { useTickerFlowExpandedStore } from '@/features/ticker/stores/tickerFlowExpandedStore';
import type { AnalyticsTab } from '@/types/ticker';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useTranslation } from '@/shared/i18n/client';
import { useBoardStore } from '@/stores/boardStore';
import { Close } from '@mui/icons-material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { logger } from '@/shared/utils/logger';
import React, { useMemo } from 'react';
import Tabs from '@/shared/ui/Tabs';
import FundamentalTab from './FundamentalTab';
import NewsTab from './NewsTab';
import TechAnalysisTab from './TechAnalysisTab';

const AddNewsAnalyticsModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    selectedTickers,
    selectedSecurityIds,
    activeTab,
    setActiveTab,
    removeTicker,
    selectedNewsIds,
    selectedFundamentalIds,
    selectedTechnicalIds,
    getTotalSelectedCount,
  } = useNewsAnalyticsModalStore();

  const { openModal: openTickerModal } = useTickerModalStore();
  const {
    isExpanded: flowExpanded,
    setExpanded: setFlowExpanded,
    reset: resetFlowExpanded,
  } = useTickerFlowExpandedStore();
  const { t } = useTranslation('ticker');
  const { viewport } = useBoardStore();

  // Fetch data using TanStack Query - load selected tickers by security IDs
  const { data: tickers = [] } = useTickersQuery({
    security_ids: selectedSecurityIds,
    limit: 100, // Get all selected tickers (max 5)
    enabled: selectedSecurityIds.length > 0, // Skip query when no tickers selected
  });
  const { data: rawAnalyticsTabs = [] } = useAnalyticsTabsQuery();
  const analyticsTabs = useMemo(
    () =>
      rawAnalyticsTabs.map((tab) => ({
        ...tab,
        label: t(`newsAnalytics.tabs.${tab.value}`),
      })),
    [rawAnalyticsTabs, t]
  );
  const { data: allNews = [] } = useNewsByTickersQuery(selectedTickers);
  const { data: allFundamental = [] } =
    useFundamentalDataByTickersQuery(selectedTickers);
  const { data: allTechnical = [] } =
    useTechnicalDataByTickersQuery(selectedTickers);

  // Calculate viewport center for card positioning
  const viewportCenter = useMemo(() => {
    return getBoardCenterWithoutInstance(viewport ?? DEFAULT_VIEWPORT);
  }, [viewport]);

  const { createCards, isCreating } = useCreateTickerCards({
    selectedTickers,
    selectedSecurityIds,
    selectedNewsIds,
    selectedFundamentalIds,
    selectedTechnicalIds,
    viewportCenter,
  });

  const selectedTickerObjects = useMemo(() => {
    return tickers.filter((ticker) => selectedTickers.includes(ticker.symbol));
  }, [tickers, selectedTickers]);

  // Get related item IDs for a ticker (across all tabs)
  const getTickerRelatedIds = (symbol: string) => {
    const relatedNewsIds = selectedNewsIds.filter((id) => {
      const news = allNews.find((n) => n.id === id);
      return news?.tickerSymbol === symbol;
    });

    const relatedFundamentalIds = selectedFundamentalIds.filter((id) => {
      const fund = allFundamental.find((f) => f.id === id);
      return fund?.tickerSymbol === symbol;
    });

    const relatedTechnicalIds = selectedTechnicalIds.filter((id) => {
      const tech = allTechnical.find((t) => t.id === id);
      return tech?.tickerSymbol === symbol;
    });

    return {
      newsIds: relatedNewsIds,
      fundamentalIds: relatedFundamentalIds,
      technicalIds: relatedTechnicalIds,
    };
  };

  const handleTickerChipClick = (symbol: string, securityId: number) => {
    const relatedIds = getTickerRelatedIds(symbol);
    // Update this modal's store and remove related items
    removeTicker(
      symbol,
      securityId,
      relatedIds.newsIds,
      relatedIds.fundamentalIds,
      relatedIds.technicalIds
    );
    // Sync back to TickerPickerModal store so "Back" button shows updated selection
    const { removeTicker: removeTickerFromPicker } =
      useTickerModalStore.getState();
    removeTickerFromPicker(symbol, securityId);
  };

  const handleBackClick = () => {
    closeModal();
    // Clear ticker selection when going back
    const { clearSelection } = useTickerModalStore.getState();
    clearSelection();
    openTickerModal();
  };

  const handleCloseModal = () => {
    closeModal();
    resetFlowExpanded();
    // Clear ticker selection when closing modal
    const { clearSelection } = useTickerModalStore.getState();
    clearSelection();
  };

  const handleAddCards = async () => {
    try {
      await createCards();
      closeModal();
      // Clear ticker selection after adding cards to board
      const { clearSelection } = useTickerModalStore.getState();
      clearSelection();
    } catch (error) {
      // Error is already handled in the hook with notifications
      logger.error('AddNewsAnalyticsModal', 'Failed to create cards', error);
    }
  };

  const totalCount = getTotalSelectedCount();
  const remainingCount = Math.max(0, 5 - totalCount);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        }
      }}
      maxWidth="lg"
      expandable
      expanded={flowExpanded}
      onExpandedChange={setFlowExpanded}
      leftContent={
        <Button
          variant="ghost"
          size="sm"
          icon={<NavigateBeforeIcon />}
          onClick={handleBackClick}
          aria-label={t('info.back')}
        />
      }
    >
      <ModalHeader className="pt-2">
        <ModalTitle>{t('newsAnalytics.title')}</ModalTitle>
      </ModalHeader>

      <ModalBody padding="none">
        <div className="flex flex-col h-full max-h-[600px] min-h-0 overflow-hidden">
          {/* Ticker Filter Chips */}
          <div className="flex-shrink-0 px-8 pb-4">
            <div className="flex items-center gap-1">
              {selectedTickerObjects.map((ticker) => {
                const relatedIds = getTickerRelatedIds(ticker.symbol);
                const selectedCount =
                  1 +
                  relatedIds.newsIds.length +
                  relatedIds.fundamentalIds.length +
                  relatedIds.technicalIds.length;
                return (
                  <button
                    key={ticker.securityId ?? `symbol-${ticker.symbol}`}
                    onClick={() => {
                      if (ticker.securityId !== undefined) {
                        handleTickerChipClick(ticker.symbol, ticker.securityId);
                      } else {
                        logger.warn(
                          'AddNewsAnalyticsModal',
                          `Ticker ${ticker.symbol} has no security_id, cannot remove`
                        );
                      }
                    }}
                    className="group flex items-center gap-1.5 rounded-3xl bg-[var(--Black-Inverse-A8)] pl-1 pr-1 py-1 transition-colors hover:bg-[var(--Black-Inverse-A12)] active:bg-[var(--Black-Inverse-A12)]"
                    aria-label={t('newsAnalytics.removeFromFilters', {
                      symbol: ticker.symbol,
                    })}
                  >
                    <TickerIcon
                      securityId={ticker.securityId}
                      symbol={ticker.symbol}
                      size={32}
                    />
                    <span className="text-xs font-medium text-[var(--Black-Inverse-A100)] leading-4">
                      {ticker.symbol}
                    </span>
                    {selectedCount > 0 ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--Black-Inverse-A56)] px-1">
                        <span className="text-[10px] font-semibold text-white leading-none group-hover:hidden">
                          {selectedCount}
                        </span>
                        <Close
                          sx={{ fontSize: 14 }}
                          className="hidden text-white group-hover:block"
                        />
                      </span>
                    ) : (
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--Black-Inverse-A4)] transition-colors group-hover:bg-[var(--Black-Inverse-A8)]"
                        aria-hidden
                      >
                        <Close
                          sx={{ fontSize: 14 }}
                          className="text-[var(--Black-Inverse-A56)] transition-colors group-hover:text-[var(--Black-Inverse-A100)]"
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 px-8">
            <Tabs
              tabs={analyticsTabs}
              value={activeTab}
              onChange={(value) => setActiveTab(value as AnalyticsTab)}
            />
          </div>

          <div className="relative h-[400px]">
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'fundamental' && <FundamentalTab />}
            {activeTab === 'techanalysis' && <TechAnalysisTab />}
          </div>
        </div>
      </ModalBody>

      <ModalFooter align="between">
        <p className="text-xs font-medium text-[var(--text-secondary)] leading-4">
          {t('newsAnalytics.remainingCards', { count: remainingCount })}
        </p>
        <Button
          variant="accent"
          size="md"
          onClick={handleAddCards}
          disabled={totalCount === 0 || isCreating}
          loading={isCreating}
        >
          {t('newsAnalytics.addToBoard', { count: totalCount })}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddNewsAnalyticsModal;

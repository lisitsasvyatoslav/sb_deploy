'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag, getDateLocaleTag } from '@/shared/utils/formatLocale';
import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import { useBoardStore } from '@/stores/boardStore';
import { useTheme } from 'next-themes';
import {
  SearchButton,
  SearchInput,
  MARKET_EVENT_TAXONOMY,
  useFeedData,
  useFilters,
  FiltersOverlay,
  NewsSnippet,
  NewsSkeleton,
  EmptyState,
} from 'finsignal-feed-explore';
import type { MarketEventTaxonomyItem, NewsItem } from 'finsignal-feed-explore';
import IconButton from '@/shared/ui/IconButton';
import { FilterIcon } from '@/shared/ui/FilterIcon';
import 'finsignal-feed-explore/dist/newsfeed.css';
import 'finsignal-feed-explore/dist/styles/globals.css';
import React, { useState, useCallback, useMemo } from 'react';
import { m } from 'framer-motion';
import { useNewsPreviewStore } from '@/stores/newsPreviewStore';
import type { NewsArticle } from '@/types/ticker';
import { useYandexMetrika } from '@/shared/hooks';
import { SelectBoardForNewsDialog } from '@/features/news/components/SelectBoardForNewsDialog';
import { FEED_API_URL } from '@/shared/utils/feedApiUrl';
import { getFeedBrand } from '@/shared/utils/feedBrand';
import TickerIcon from '@/shared/ui/TickerIcon';
import { useNewsTickerEnrichment } from '@/features/news/hooks/useNewsTickerEnrichment';
import { useNewsBookmark } from '@/features/news/hooks/useNewsBookmark';
import { useNewsAIChat } from '@/features/news/hooks/useNewsAIChat';
import { useNewsAnalytics } from '@/features/news/hooks/useNewsAnalytics';

const NewsSidebar: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const locale = getLocaleTag(i18n.language);
  const dateLocale = getDateLocaleTag(i18n.language);
  const { isOpen } = useNewsSidebarStore();
  const { boardId, viewport } = useBoardStore();
  const { resolvedTheme: theme } = useTheme();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filtersSearch, setFiltersSearch] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingNews, setPendingNews] = useState<NewsItem | null>(null);
  const [pendingAction, setPendingAction] = useState<'bookmark' | 'ai'>(
    'bookmark'
  );

  const { trackEvent } = useYandexMetrika();

  const { selectedMarketEvents, setFilters, clearFilters } = useFilters(
    [],
    'feedFilters'
  );

  const {
    items: feedItems,
    isLoading,
    hasMore,
    loadMore,
  } = useFeedData({
    apiUrl: FEED_API_URL,
    filters: selectedMarketEvents,
    query: searchQuery.trim() || undefined,
    limit: 20,
  });

  const enrichedItems = useNewsTickerEnrichment(feedItems, locale);

  const { handleAddNewsToBoardIds, handleBookmarkClick, buildNewsCardData } =
    useNewsBookmark({
      boardId,
      viewport,
      setPendingNews,
      setPendingAction,
    });

  const { handleAIClick, handleSelectBoardAdd } = useNewsAIChat({
    boardId,
    buildNewsCardData,
    setPendingNews,
    setPendingAction,
    handleAddNewsToBoardIds,
    pendingNews,
    pendingAction,
  });

  const { handleWidgetMouseEnter, handleWidgetMouseLeave, handleScroll } =
    useNewsAnalytics({
      boardId,
      isOpen,
      isLoading,
      feedItemsLength: feedItems.length,
      hasMore,
      loadMore,
    });

  const filteredTaxonomy = useMemo<MarketEventTaxonomyItem[]>(() => {
    if (!filtersSearch.trim()) return MARKET_EVENT_TAXONOMY;
    const q = filtersSearch.toLowerCase();
    return MARKET_EVENT_TAXONOMY.filter(
      (item) =>
        item.nameRu?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.categoryRu?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [filtersSearch]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchMode((prev) => {
      if (prev) setSearchQuery('');
      return !prev;
    });
  }, []);

  const handleCancelSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery('');
  }, []);

  const handleFiltersClose = useCallback(() => {
    setIsFiltersOpen(false);
    setFiltersSearch('');
  }, []);

  const handleFiltersApply = useCallback(
    (filters: string[]) => {
      setFilters(filters);
      setIsFiltersOpen(false);
      setFiltersSearch('');
    },
    [setFilters]
  );

  const handleFiltersCancel = useCallback(() => {
    setIsFiltersOpen(false);
    setFiltersSearch('');
  }, []);

  const { openWithNews } = useNewsPreviewStore();

  const handleNewsClick = useCallback(
    (news: NewsItem) => {
      const withId = news as NewsItem & { id?: string | number };
      const rawId = 'id' in withId ? withId.id : undefined;
      const newsId =
        rawId !== undefined && rawId !== null && String(rawId).length > 0
          ? String(rawId)
          : (news.sourceUrl ?? '');
      if (newsId.length > 0) {
        trackEvent('news_viewed', { news_id: newsId });
      }
      const article: NewsArticle = {
        id: newsId || 'explore-news',
        tickerSymbol: '',
        headline: news.title,
        content: news.fullContent || news.content || news.summary || '',
        source: news.sourceName || news.source || '',
        url: news.sourceUrl,
        date: news.timestamp
          ? new Date(news.timestamp).toLocaleDateString(dateLocale)
          : '',
        time: news.timestamp
          ? new Date(news.timestamp).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        timestamp: news.timestamp || undefined,
      };
      openWithNews(article);
    },
    [openWithNews, locale, trackEvent]
  );

  const feedTheme = theme === 'dark' ? 'dark' : 'light';

  const renderStockIcon = useCallback(
    (symbol: string, securityId?: number): React.ReactNode => (
      <TickerIcon
        symbol={symbol}
        securityId={securityId}
        size={20}
        className="news-snippet__stock-logo"
      />
    ),
    []
  );

  return (
    <>
      <m.div
        className="relative flex-shrink-0 z-50"
        initial={false}
        animate={{ width: isOpen ? LAYOUT_CONSTANTS.SIDEBAR_CONTENT_WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 44 }}
      >
        <m.div
          data-news-feed
          className={`flex flex-col h-[100%] relative bg-[var(--sidebar-bg)] ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } overflow-hidden`}
          animate={{
            width: isOpen ? LAYOUT_CONSTANTS.SIDEBAR_CONTENT_WIDTH : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 44 }}
          onMouseEnter={handleWidgetMouseEnter}
          onMouseLeave={handleWidgetMouseLeave}
        >
          {isOpen && (
            <div
              className="absolute top-0 right-0 w-px h-full pointer-events-none z-10"
              style={{
                background:
                  'linear-gradient(0deg, var(--text-icon-black-inverse-a-0, rgba(4, 4, 5, 0.00)) 0%, var(--Stroke-A4, rgba(4, 4, 5, 0.04)) 10%, var(--Stroke-A4, rgba(4, 4, 5, 0.04)) 90%, var(--text-icon-black-inverse-a-0, rgba(4, 4, 5, 0.00)) 100%)',
              }}
            />
          )}

          {isOpen && (
            <div className="flex items-center gap-2 flex-shrink-0 bg-[var(--sidebar-bg)] pt-2 pr-1.5 pb-2 pl-4">
              {isFiltersOpen ? (
                <div className="w-full">
                  <SearchInput
                    value={filtersSearch}
                    onChange={setFiltersSearch}
                    onCancel={handleFiltersCancel}
                    placeholder={t('newsSidebar.filterSearchPlaceholder')}
                    cancelLabel={t('newsSidebar.cancelSearch')}
                    autoFocus={true}
                    brand={getFeedBrand()}
                  />
                </div>
              ) : !isSearchMode ? (
                <>
                  <h2 className="flex-1 font-inter font-semibold text-[14px] leading-[20px] tracking-[-0.2px] uppercase text-[var(--text-primary)]">
                    EXPLORE
                  </h2>
                  <div className="flex items-center gap-0">
                    <IconButton
                      icon={<FilterIcon />}
                      size={32}
                      isActive={isFiltersOpen}
                      counterValue={selectedMarketEvents.length}
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      ariaLabel="Open filters"
                    />
                    <SearchButton onClick={handleSearchToggle} />
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onCancel={handleCancelSearch}
                    placeholder={t('newsSidebar.searchPlaceholder')}
                    cancelLabel={t('newsSidebar.cancelSearch')}
                    autoFocus={true}
                    brand={getFeedBrand()}
                  />
                </div>
              )}
            </div>
          )}

          {isOpen && (
            <div
              className="flex-1 overflow-auto scrollbar-hide relative"
              onScroll={handleScroll}
            >
              {isFiltersOpen ? (
                <FiltersOverlay
                  isOpen={isFiltersOpen}
                  selectedFilters={selectedMarketEvents}
                  onClose={handleFiltersClose}
                  onApply={handleFiltersApply}
                  onReset={clearFilters}
                  marketEventsTaxonomy={filteredTaxonomy}
                  theme={feedTheme}
                  locale={locale}
                  brand={getFeedBrand()}
                />
              ) : isLoading && enrichedItems.length === 0 ? (
                <NewsSkeleton count={5} theme={feedTheme} />
              ) : !isLoading && enrichedItems.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {enrichedItems.map((news) => (
                    <NewsSnippet
                      key={news.id}
                      news={news}
                      onPress={() => handleNewsClick(news)}
                      onBookmark={() => handleBookmarkClick(news)}
                      onAI={() => handleAIClick(news)}
                      showBookmarkIcon={true}
                      showAIIcon={true}
                      theme={feedTheme}
                      locale={locale}
                      draggable={true}
                      renderStockIcon={renderStockIcon}
                      onDragStart={(e) => {
                        const newsData = {
                          ...news,
                          content: news.fullContent || news.content,
                        };
                        e.dataTransfer.setData(
                          'application/news-data',
                          JSON.stringify(newsData)
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    />
                  ))}
                  {isLoading && <NewsSkeleton count={2} theme={feedTheme} />}
                </>
              )}
            </div>
          )}
        </m.div>
      </m.div>

      <SelectBoardForNewsDialog
        isOpen={!!pendingNews}
        onClose={() => {
          setPendingNews(null);
          setPendingAction('bookmark');
        }}
        onAdd={handleSelectBoardAdd}
      />
    </>
  );
};

export default NewsSidebar;

import {
  Chip,
  NewsSnippet,
  NewsSkeleton,
  MARKET_EVENT_TAXONOMY,
  useFeedData,
} from 'finsignal-feed-explore';
import type { NewsItem, MarketEventTaxonomyItem } from 'finsignal-feed-explore';
import 'finsignal-feed-explore/dist/newsfeed.css';
import 'finsignal-feed-explore/dist/styles/globals.css';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag, formatTickerPrice } from '@/shared/utils/formatters';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import { useNewsPreviewStore } from '@/stores/newsPreviewStore';
import { useNewsFeedWidgetStore } from '@/stores/newsFeedWidgetStore';
import { useNewsFeedConfigStore } from '@/stores/newsFeedConfigStore';
import { FEED_API_URL } from '@/shared/utils/feedApiUrl';
import { useUpdateCardMutation } from '@/features/board/queries';
import { useInfiniteTickersQuery } from '@/features/ticker/queries';
import { useDebounce } from '@/shared/hooks/useDebounce';
import Button from '@/shared/ui/Button';
import TickerIcon from '@/shared/ui/TickerIcon';
import SearchInput from '@/shared/ui/SearchInput';
import Table, { TableColumn } from '@/shared/ui/Table';
import { Icon } from '@/shared/ui/Icon';
import type { CardMeta } from '@/types';
import type { NewsArticle, Ticker } from '@/types/ticker';

const AI_PREVIEW_LIMIT = 5;

type ConfigTab = 'filters' | 'tickers';

function getChangeColor(value: number): string {
  if (value > 0) return 'text-status-success';
  if (value < 0) return 'text-status-negative';
  return 'text-blackinverse-a100';
}

interface NewsFeedWidgetProps {
  cardId: number;
  meta?: CardMeta;
  boardId?: number;
}

export const NewsFeedWidget: React.FC<NewsFeedWidgetProps> = ({
  cardId,
  meta,
  boardId,
}) => {
  const { resolvedTheme: theme } = useTheme();
  const { t, i18n } = useTranslation('common');
  const locale = getLocaleTag(i18n.language);
  const dateLocale = getDateLocaleTag(i18n.language);
  const { openWithNews } = useNewsPreviewStore();
  const { setItems, clearItems } = useNewsFeedWidgetStore();
  const { configuringCardId, openConfig, closeConfig } =
    useNewsFeedConfigStore();
  const updateCardMutation = useUpdateCardMutation();

  const isConfiguring = configuringCardId === cardId;

  const metaFilters = useMemo<string[]>(
    () =>
      Array.isArray(meta?.newsFilters) ? (meta.newsFilters as string[]) : [],

    [meta?.newsFilters]
  );

  const metaTickers = useMemo<string[]>(
    () =>
      Array.isArray(meta?.newsTickers) ? (meta.newsTickers as string[]) : [],

    [meta?.newsTickers]
  );

  const [activeFilters, setActiveFilters] = useState<string[]>(metaFilters);
  const [activeTickers, setActiveTickers] = useState<string[]>(metaTickers);

  const [activeTab, setActiveTab] = useState<ConfigTab>('filters');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(metaFilters);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(metaTickers);
  const [filterSearch, setFilterSearch] = useState('');
  const [tickerSearch, setTickerSearch] = useState('');
  const debouncedTickerSearch = useDebounce(tickerSearch, 300);
  const [sortField, setSortField] = useState('fundamental_market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentSortColumn, setCurrentSortColumn] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!isConfiguring) {
      setActiveFilters(metaFilters);
      setActiveTickers(metaTickers);
    }
  }, [metaFilters, metaTickers]);

  useEffect(() => {
    if (isConfiguring) {
      setSelectedFilters(metaFilters);
      setSelectedTickers(metaTickers);
      setActiveTab('filters');
      setFilterSearch('');
      setTickerSearch('');
      setSortField('fundamental_market_cap');
      setSortOrder('desc');
      setCurrentSortColumn('');
      setCollapsedGroups(new Set());
    }
  }, [isConfiguring]);

  const filteredTaxonomy = useMemo<MarketEventTaxonomyItem[]>(() => {
    if (!filterSearch.trim()) return MARKET_EVENT_TAXONOMY;
    const q = filterSearch.toLowerCase();
    return MARKET_EVENT_TAXONOMY.filter(
      (item) =>
        item.nameRu?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.categoryRu?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [filterSearch]);

  const groupedFilters = useMemo(() => {
    const groups = new Map<
      string,
      { category: string; categoryRu: string; items: MarketEventTaxonomyItem[] }
    >();
    filteredTaxonomy.forEach((item) => {
      if (!groups.has(item.category)) {
        groups.set(item.category, {
          category: item.category,
          categoryRu: item.categoryRu,
          items: [],
        });
      }
      groups.get(item.category)!.items.push(item);
    });
    return Array.from(groups.values());
  }, [filteredTaxonomy]);

  const toggleGroup = useCallback((category: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const {
    data: tickerPages,
    isLoading: isLoadingTickers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTickersQuery({
    search: debouncedTickerSearch || undefined,
    limit: 20,
    sort: sortField,
    ordering: sortOrder,
    enabled: isConfiguring && activeTab === 'tickers',
  });

  const tickerRows = useMemo(() => {
    const all = tickerPages?.pages.flatMap((p) => p) ?? [];
    const map = new Map<string, Ticker>();
    all.forEach((ticker) => {
      if (!map.has(ticker.symbol)) map.set(ticker.symbol, ticker);
    });
    return Array.from(map.values());
  }, [tickerPages]);

  const {
    items: feedItems,
    isLoading: isFeedLoading,
    hasMore,
    loadMore,
  } = useFeedData({
    apiUrl: FEED_API_URL,
    filters: activeFilters,
    tickers: activeTickers,
    limit: 20,
  });

  useEffect(() => {
    if (feedItems.length > 0) {
      setItems(cardId, feedItems.slice(0, AI_PREVIEW_LIMIT));
    }
  }, [feedItems, cardId, setItems]);

  useEffect(() => {
    return () => {
      clearItems(cardId);
    };
  }, [cardId, clearItems]);

  const handleNewsClick = useCallback(
    (news: NewsItem) => {
      openWithNews({
        id: news.id ?? '',
        tickerSymbol: '',
        headline: news.title,
        content: news.fullContent || news.content || '',
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
      } satisfies NewsArticle);
    },
    [openWithNews, locale]
  );

  const toggleFilter = useCallback((key: string) => {
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }, []);

  const handleToggleTicker = useCallback((symbol: string) => {
    setSelectedTickers((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFilters([]);
    setSelectedTickers([]);
  }, []);

  const handleOpenConfig = useCallback(() => {
    openConfig(cardId);
  }, [openConfig, cardId]);

  const handleApply = useCallback(async () => {
    const prevFilters = activeFilters;
    const prevTickers = activeTickers;
    setActiveFilters(selectedFilters);
    setActiveTickers(selectedTickers);
    try {
      await updateCardMutation.mutateAsync({
        id: cardId,
        data: {
          meta: {
            widgetType: 'news_feed',
            newsFilters: selectedFilters,
            newsTickers: selectedTickers,
          },
        },
        boardId,
      });
      closeConfig();
    } catch {
      setActiveFilters(prevFilters);
      setActiveTickers(prevTickers);
    }
  }, [
    cardId,
    boardId,
    activeFilters,
    activeTickers,
    selectedFilters,
    selectedTickers,
    updateCardMutation,
    closeConfig,
  ]);

  const handleSortChange = useCallback(
    (columnKey: string, direction: 'asc' | 'desc' | null) => {
      const fieldMap: Record<string, string> = {
        name: 'symbol',
        price: 'quote_last',
        priceChange: 'quote_change_percent',
        yearlyChange: 'yield_1y',
      };
      if (direction === null) {
        setSortField('fundamental_market_cap');
        setSortOrder('desc');
        setCurrentSortColumn('');
      } else {
        setSortField(fieldMap[columnKey] || 'fundamental_market_cap');
        setSortOrder(direction);
        setCurrentSortColumn(columnKey);
      }
    },
    []
  );

  const tickerColumns = useMemo<TableColumn<Ticker>[]>(
    () => [
      {
        key: 'name',
        label: t('newsWidgetModal.columns.instrument'),
        sortable: true,
        render: (row) => {
          const isSelected = selectedTickers.includes(row.symbol);
          return (
            <div className="flex gap-[6px] items-center min-w-0">
              <div className="relative shrink-0">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-brand-base flex items-center justify-center">
                    <Icon variant="tick" size={14} className="text-white" />
                  </div>
                ) : (
                  <TickerIcon
                    securityId={row.securityId}
                    symbol={row.symbol}
                    size={24}
                  />
                )}
              </div>
              <span className="text-xs font-medium tracking-[-0.2px] text-blackinverse-a100">
                {row.symbol}
              </span>
            </div>
          );
        },
      },
      {
        key: 'price',
        label: t('newsWidgetModal.columns.currentPrice'),
        sortable: true,
        align: 'right',
        render: (row) => (
          <span className="text-xs font-medium tracking-[-0.2px] text-blackinverse-a100 whitespace-nowrap">
            {formatTickerPrice(row.price, row.currency, locale)}
          </span>
        ),
      },
      {
        key: 'priceChange',
        label: t('newsWidgetModal.columns.daily'),
        sortable: true,
        align: 'right',
        render: (row) => (
          <span
            className={`text-xs font-medium tracking-[-0.2px] whitespace-nowrap ${getChangeColor(row.priceChange)}`}
          >
            {formatTickerPrice(row.priceChange, row.currency, locale)}
          </span>
        ),
      },
      {
        key: 'yearlyChange',
        label: t('newsWidgetModal.columns.yearly'),
        sortable: true,
        align: 'right',
        render: (row) => (
          <span
            className={`text-xs font-medium tracking-[-0.2px] whitespace-nowrap ${getChangeColor(row.yearlyChange)}`}
          >
            {formatTickerPrice(row.yearlyChange, row.currency, locale)}
          </span>
        ),
      },
    ],
    [t, locale, selectedTickers]
  );

  const totalCount = selectedFilters.length + selectedTickers.length;

  const hasUnsavedChanges = useMemo(() => {
    if (selectedFilters.length !== metaFilters.length) return true;
    if (selectedTickers.length !== metaTickers.length) return true;
    if (selectedFilters.some((f) => !metaFilters.includes(f))) return true;
    if (selectedTickers.some((ticker) => !metaTickers.includes(ticker)))
      return true;
    return false;
  }, [selectedFilters, selectedTickers, metaFilters, metaTickers]);

  if (isConfiguring) {
    return (
      <div
        className="relative flex flex-col h-full overflow-hidden nowheel nodrag nopan"
        style={{ background: 'var(--base-bg)' }}
      >
        <div className="flex-shrink-0 px-3 pt-3 pb-2">
          <div
            className="flex p-[2px] gap-[2px] self-stretch"
            style={{
              borderRadius: '2px',
              background: 'var(--news-segment-bg)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {(['filters', 'tickers'] as ConfigTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const count =
                tab === 'filters'
                  ? selectedFilters.length
                  : selectedTickers.length;
              const label = t(`newsWidgetModal.tab.${tab}`);
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-12 font-medium transition-all"
                  style={{
                    minHeight: '28px',
                    padding: '4px 8px',
                    borderRadius: '1px',
                    background: isActive
                      ? 'var(--news-segment-tab-active-bg)'
                      : 'transparent',
                    boxShadow: isActive
                      ? '0 1px 4px 0 rgba(4,4,5,0.08)'
                      : 'none',
                    color: isActive
                      ? 'var(--filters-text-primary)'
                      : 'var(--filters-text-secondary)',
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-10 font-semibold"
                      style={{
                        borderRadius: '8px',
                        background: isActive
                          ? 'var(--news-segment-badge-active-bg)'
                          : 'var(--news-segment-badge-inactive-bg)',
                        color: 'var(--news-segment-badge-color)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-shrink-0 px-3 pb-2">
          {activeTab === 'filters' ? (
            <SearchInput
              size="sm"
              placeholder={t('newsWidgetModal.searchPlaceholder')}
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              onClear={() => setFilterSearch('')}
            />
          ) : (
            <SearchInput
              size="sm"
              placeholder={t('newsWidgetModal.tickerSearchPlaceholder')}
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value)}
              onClear={() => setTickerSearch('')}
            />
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'filters' && (
            <div
              className="filters-overlay h-full overflow-y-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              <div
                className="filters-overlay__content"
                style={{ padding: '12px', paddingBottom: '4rem' }}
              >
                {groupedFilters.length === 0 ? (
                  <div
                    className="flex items-center justify-center h-20 text-13"
                    style={{ color: 'var(--filters-text-secondary)' }}
                  >
                    {t('newsWidgetModal.noResults')}
                  </div>
                ) : (
                  groupedFilters.map((group) => {
                    const isCollapsed = collapsedGroups.has(group.category);
                    return (
                      <div
                        key={group.category}
                        className="filters-overlay__category"
                      >
                        <button
                          type="button"
                          className="filters-overlay__category-header"
                          onClick={() => toggleGroup(group.category)}
                          aria-expanded={!isCollapsed}
                        >
                          <span className="filters-overlay__category-title">
                            {locale.startsWith('ru')
                              ? group.categoryRu
                              : group.category}
                          </span>
                          <svg
                            className={`filters-overlay__category-chevron${isCollapsed ? ' collapsed' : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        {!isCollapsed && (
                          <div className="filters-overlay__chips">
                            {group.items.map((item) => (
                              <Chip
                                key={item.key}
                                label={
                                  locale.startsWith('ru')
                                    ? item.nameRu || item.name
                                    : item.name || item.nameRu
                                }
                                selected={selectedFilters.includes(item.key)}
                                onToggle={() => toggleFilter(item.key)}
                                theme={theme === 'dark' ? 'dark' : 'light'}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'tickers' && (
            <div className="h-full min-h-0">
              {isLoadingTickers && tickerRows.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full text-13"
                  style={{ color: 'var(--filters-text-secondary)' }}
                >
                  {t('newsWidgetModal.loadingTickers')}
                </div>
              ) : (
                <Table
                  columns={tickerColumns}
                  rows={tickerRows}
                  onSort={handleSortChange}
                  currentSort={
                    currentSortColumn
                      ? { columnKey: currentSortColumn, direction: sortOrder }
                      : undefined
                  }
                  onRowClick={(row) => handleToggleTicker(row.symbol)}
                  getRowKey={(row) => row.symbol}
                  getRowId={(row) =>
                    String(row.securityId ?? `symbol-${row.symbol}`)
                  }
                  selectedRows={tickerRows
                    .filter((tr) => selectedTickers.includes(tr.symbol))
                    .map((tr) =>
                      String(tr.securityId ?? `symbol-${tr.symbol}`)
                    )}
                  selectedRowClassName="bg-brand-bg"
                  isEqualGap
                  density="compact"
                  headerClassName="bg-transparent"
                  contentPaddingX="px-3"
                  cellGap="gap-[2px]"
                  equalColumns
                  headerTextClassName="text-blackinverse-a32"
                  rowClassName="py-[6px]"
                  headerCellClassName={(_key, isFirst) =>
                    isFirst ? 'pl-[6px] pr-[2px] py-[6px]' : 'px-[2px] py-[8px]'
                  }
                  rowCellClassName={(_key, isFirst) =>
                    isFirst ? 'p-[2px]' : 'px-[2px] py-0'
                  }
                  virtualized={{
                    enabled: true,
                    estimateSize: 44,
                    overscan: 5,
                    onScrollEnd: () => {
                      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    },
                    scrollEndThreshold: 1,
                    isLoadingMore: isFetchingNextPage,
                    paddingBottom: 64,
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-3 py-3"
          style={{
            background: 'var(--filters-footer-gradient)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2 transition-opacity hover:opacity-70 active:opacity-50"
            style={{
              borderRadius: '2px',
              background: 'var(--filters-btn-reset-bg)',
              backdropFilter: 'blur(40px)',
              color: 'var(--filters-btn-reset-text)',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              letterSpacing: '-0.2px',
              opacity: totalCount === 0 ? 0.35 : undefined,
            }}
          >
            {t('newsWidgetModal.reset')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={updateCardMutation.isPending}
            className="flex-1 py-2 transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed"
            style={{
              borderRadius: '2px',
              background: 'var(--filters-btn-apply-bg)',
              backdropFilter: 'blur(12px)',
              color: 'var(--filters-btn-apply-text)',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              letterSpacing: '-0.2px',
              opacity:
                !hasUnsavedChanges || updateCardMutation.isPending
                  ? 0.35
                  : undefined,
            }}
          >
            {totalCount > 0
              ? `${t('newsWidgetModal.apply')} (${totalCount})`
              : t('newsWidgetModal.apply')}
          </button>
        </div>
      </div>
    );
  }

  const feedTheme = theme === 'dark' ? 'dark' : 'light';

  if (isFeedLoading && feedItems.length === 0) {
    return (
      <div className="h-full overflow-hidden nowheel nodrag nopan">
        <NewsSkeleton count={5} theme={feedTheme} />
      </div>
    );
  }

  if (!isFeedLoading && feedItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6 nowheel nodrag nopan">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-14 font-semibold text-[var(--text-primary)]">
            {t('newsWidgetModal.emptyTitle')}
          </span>
          <span className="text-12 text-[var(--text-secondary)]">
            {t('newsWidgetModal.emptyDescription')}
          </span>
        </div>
        <Button size="sm" variant="primary" onClick={handleOpenConfig}>
          {t('newsWidgetModal.changeFilters')}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto nowheel nodrag nopan"
      style={{ scrollbarWidth: 'none' }}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (
          hasMore &&
          !isFeedLoading &&
          el.scrollHeight - el.scrollTop - el.clientHeight < 200
        ) {
          loadMore();
        }
      }}
    >
      {feedItems.map((news) => (
        <NewsSnippet
          key={news.id}
          news={news}
          onPress={() => handleNewsClick(news)}
          theme={feedTheme}
          locale={locale}
          showBookmarkIcon={false}
          showAIIcon={false}
          showShareIcon={false}
          showLikeIcon={false}
          showDislikeIcon={false}
          showSource={true}
          showAISummary={false}
          showStockCards={false}
          draggable={true}
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
      {isFeedLoading && <NewsSkeleton count={2} theme={feedTheme} />}
    </div>
  );
};

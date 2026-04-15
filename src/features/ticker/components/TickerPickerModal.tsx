import TickerIcon from '@/shared/ui/TickerIcon';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon/Icon';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';
import Table, { TableColumn } from '@/shared/ui/Table';
import SearchInput from '@/shared/ui/SearchInput';
import {
  boardQueryKeys,
  useUpdateCardMutation,
} from '@/features/board/queries';
import { showErrorToast } from '@/shared/utils/toast';
import { useInfiniteTickersQuery } from '@/features/ticker/queries';
import { useNewsAnalyticsModalStore } from '@/features/ticker/stores/newsAnalyticsModalStore';
import { useTickerFlowExpandedStore } from '@/features/ticker/stores/tickerFlowExpandedStore';
import { useTickerInfoStore } from '@/features/ticker/stores/tickerInfoStore';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { useTranslation } from '@/shared/i18n/client';
import { edgeApi } from '@/services/api/edges';
import { useBoardStore } from '@/stores/boardStore';
import { Ticker } from '@/types/ticker';
import { formatTickerPrice, getLocaleTag } from '@/shared/utils/formatters';
import { REGION } from '@/shared/config/region';
import { Check, InfoSharp } from '@mui/icons-material';
import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

const SparklineChart = lazy(() => import('./SparklineChart'));

const TickerPickerModal: React.FC = () => {
  const {
    isOpen,
    mode,
    boardTickerConfig,
    initialSearchQuery,
    closeModal,
    selectedTickers,
    selectedSecurityIds,
    selectedTickerNames,
    toggleTicker,
  } = useTickerModalStore();
  const { openModal: openInfoModal } = useTickerInfoStore();
  const { openModal: openNewsAnalyticsModal } = useNewsAnalyticsModalStore();
  const {
    isExpanded: flowExpanded,
    setExpanded: setFlowExpanded,
    reset: resetFlowExpanded,
  } = useTickerFlowExpandedStore();
  const updateCardMutation = useUpdateCardMutation();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);
  const isBoardMode = mode === 'board_ticker';
  const tickerAddGlow = useGlowTarget('ticker-add-button');
  const tickerListGlow = useGlowTarget('add-ticker');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarket] = useState('popular');
  const [sortField, setSortField] = useState<string>('fundamental_market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentSortColumn, setCurrentSortColumn] = useState<string>(''); // Track which column is sorted
  const { trackEvent } = useYandexMetrika();
  const lastTrackedQuery = useRef<string>('');
  const selectedTickerCache = useRef<Map<string, Ticker>>(new Map());

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialSearchQuery || '');
      setSortField('fundamental_market_cap');
      setSortOrder('desc');
      setCurrentSortColumn('');
      selectedTickerCache.current.clear();
    }
  }, [isOpen, initialSearchQuery]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Track ticker_search when debounced query changes
  useEffect(() => {
    if (
      debouncedSearchQuery &&
      debouncedSearchQuery !== lastTrackedQuery.current &&
      debouncedSearchQuery.length >= 2
    ) {
      lastTrackedQuery.current = debouncedSearchQuery;
      trackEvent('ticker_search', {
        query: debouncedSearchQuery,
        market: activeMarket === 'popular' ? undefined : activeMarket,
        type: undefined,
        ticker: undefined,
      });
    }
  }, [debouncedSearchQuery, activeMarket, trackEvent]);

  // Fetch available markets
  // const { data: markets = [], isLoading: isLoadingMarkets } = useMarketsQuery();

  const getBackendSortField = (columnKey: string): string => {
    const sortFieldMap: Record<string, string> = {
      name: 'symbol',
      price: 'quote_last',
      priceChange: 'quote_change_percent',
      yearlyChange: 'yield_1y',
    };
    return sortFieldMap[columnKey] || 'fundamental_market_cap';
  };

  const marketId =
    activeMarket === 'popular' ? undefined : Number(activeMarket);
  const isCrypto = marketId === 5;

  const {
    data,
    isLoading: isLoadingTickers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTickersQuery({
    search: debouncedSearchQuery || undefined,
    market: marketId,
    type: isCrypto ? 7 : undefined,
    limit: 20,
    sort: sortField,
    ordering: sortOrder,
    enabled: isOpen,
  });

  const tickers = useMemo(() => {
    const allTickers = data?.pages.flatMap((page) => page) ?? [];
    const uniqueTickersMap = new Map<string, Ticker>();
    allTickers.forEach((ticker) => {
      if (!uniqueTickersMap.has(ticker.symbol)) {
        uniqueTickersMap.set(ticker.symbol, ticker);
      }
    });
    return Array.from(uniqueTickersMap.values());
  }, [data]);

  // Table columns
  const getChangeValueColorClass = (value: number) => {
    if (value > 0) return 'text-status-success';
    if (value < 0) return 'text-status-negative';
    return 'text-blackinverse-a100';
  };

  const columns: TableColumn<Ticker>[] = [
    {
      key: 'name',
      label: t('picker.columns.instrument'),
      sortable: true,
      render: (row) => {
        const isSelected = selectedTickers.includes(row.symbol);
        return (
          <div className="flex gap-[6px] items-center min-w-0">
            <div className="relative shrink-0">
              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-brand-base flex items-center justify-center">
                  <Check sx={{ fontSize: 20, color: 'white' }} />
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
      label: t('picker.columns.currentPrice'),
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
      label: t('picker.columns.daily'),
      sortable: true,
      align: 'right',
      render: (row) => (
        <span
          className={`text-xs font-medium tracking-[-0.2px] whitespace-nowrap ${getChangeValueColorClass(row.priceChange)}`}
        >
          {formatTickerPrice(row.priceChange, row.currency, locale)}
        </span>
      ),
    },
    {
      key: 'yearlyChange',
      label: t('picker.columns.yearly'),
      sortable: true,
      align: 'right',
      render: (row) => (
        <span
          className={`text-xs font-medium tracking-[-0.2px] whitespace-nowrap ${getChangeValueColorClass(row.yearlyChange)}`}
        >
          {formatTickerPrice(row.yearlyChange, row.currency, locale)}
        </span>
      ),
    },
    {
      key: 'sparkline',
      label: t('picker.columns.dynamics'),
      align: 'center',
      render: (row) => (
        <Suspense fallback={null}>
          <SparklineChart
            data={row.sparkline}
            width={90}
            height={24}
            period="all"
          />
        </Suspense>
      ),
    },
  ];

  const handleRowClick = (row: Ticker) => {
    if (row.securityId !== undefined) {
      if (selectedTickers.includes(row.symbol)) {
        selectedTickerCache.current.delete(row.symbol);
      } else {
        if (isBoardMode) {
          selectedTickerCache.current.clear();
        }
        selectedTickerCache.current.set(row.symbol, row);
      }
      toggleTicker(
        row.symbol,
        row.securityId,
        REGION === 'us' ? row.symbol : row.name
      );
    } else {
      console.warn(`Ticker ${row.symbol} has no securityId, cannot select`);
    }
  };

  const handleContinue = async () => {
    if (isBoardMode && boardTickerConfig) {
      const symbol = selectedTickers[0];
      const securityId = selectedSecurityIds[0];
      const tickerName = selectedTickerNames[0] || symbol;

      const nodes = useBoardStore.getState().nodes;
      const strategyNode = nodes.find((n) => n.data?.type === 'strategy');

      const positionUpdate: Record<string, number> = {};
      if (strategyNode) {
        positionUpdate.x = Math.round(strategyNode.position.x - 260 - 120);
        positionUpdate.y = Math.round(strategyNode.position.y);
      }

      try {
        await updateCardMutation.mutateAsync({
          id: boardTickerConfig.cardId,
          data: {
            title: t('picker.tickerTitle', { symbol }),
            meta: {
              widgetType: 'ticker_card',
              security_id: securityId,
              tickerSymbol: symbol,
              tickerName: tickerName,
            },
            width: 260,
            height: 260,
            ...positionUpdate,
          },
          boardId: boardTickerConfig.boardId,
        });

        if (strategyNode) {
          const strategyCardId = parseInt(
            strategyNode.id.replace('card-', ''),
            10
          );

          try {
            await edgeApi.createEdge({
              sourceCardId: boardTickerConfig.cardId,
              targetCardId: strategyCardId,
              edgeType: 'port',
              meta: {
                sourceHandle: 'output_ticker_0',
                targetHandle: 'input_ticker_0',
              },
            });
          } catch (error) {
            console.error('Edge creation failed:', error);
          }

          await queryClient.cancelQueries({ queryKey: boardQueryKeys.edges() });
          await queryClient.refetchQueries({
            queryKey: boardQueryKeys.edges(),
          });
        }

        const pathname =
          typeof window !== 'undefined' ? window.location.pathname : '';
        if (pathname.startsWith('/ideas/') && symbol) {
          trackEvent('ticker_added', {
            board_id: boardTickerConfig.boardId,
            board_type: 'space',
            tickers: symbol,
          });
        }

        closeModal();
      } catch (error) {
        console.error('Failed to add ticker to board:', error);
        showErrorToast(t('picker.addError'));
      }

      return;
    }

    closeModal();
    openNewsAnalyticsModal(selectedTickers, selectedSecurityIds);
  };

  const handleInfoClick = (e: React.MouseEvent, ticker: Ticker) => {
    e.stopPropagation();
    if (ticker.securityId) {
      openInfoModal(ticker.securityId, true); // Show back button when opened from picker modal
    } else {
      console.warn('Ticker missing securityId:', ticker);
    }
  };

  const handleRemoveChip = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const symbolIndex = selectedTickers.indexOf(symbol);
    if (symbolIndex !== -1 && symbolIndex < selectedSecurityIds.length) {
      const securityId = selectedSecurityIds[symbolIndex];
      selectedTickerCache.current.delete(symbol);
      toggleTicker(symbol, securityId);
    }
  };

  const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
    queryClient.removeQueries({
      queryKey: ['tickers', 'infinite'],
      exact: false,
    });

    if (direction === null) {
      setSortField('fundamental_market_cap');
      setSortOrder('desc');
      setCurrentSortColumn('');
    } else {
      const backendSortField = getBackendSortField(columnKey);
      setSortField(backendSortField);
      setSortOrder(direction);
      setCurrentSortColumn(columnKey);
    }
  };

  const selectedTickerObjects = useMemo(() => {
    return selectedTickers
      .map((symbol) => selectedTickerCache.current.get(symbol))
      .filter(Boolean) as Ticker[];
  }, [selectedTickers]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetFlowExpanded();
          closeModal();
        }
      }}
      maxWidth="lg"
      expandable
      expanded={flowExpanded}
      onExpandedChange={setFlowExpanded}
    >
      <ModalHeader className="!px-12 pt-6 !pb-8">
        <ModalTitle>
          {isBoardMode ? t('picker.addTickers') : t('picker.selectTickers')}
        </ModalTitle>
      </ModalHeader>

      <ModalBody
        padding="none"
        className="flex flex-col h-full max-h-full min-h-0 overflow-hidden"
      >
        {/* Search input and selected chips - fixed */}
        <div className="shrink-0 px-12 pb-3 pt-0">
          <SearchInput
            size="md"
            placeholder={t('picker.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Table - scrollable content with virtual scrolling */}
        <GlowBorder
          active={tickerListGlow}
          borderRadius={4}
          borderWidth={3}
          className="relative flex-1 min-h-0 flex flex-col pt-0 pb-0"
        >
          <div className="flex-1 min-h-0 flex flex-col">
            {isLoadingTickers && tickers.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-sm text-[var(--text-secondary)]">
                  {t('picker.loadingTickers')}
                </div>
              </div>
            ) : (
              <Table
                columns={columns}
                rows={tickers}
                onSort={handleSort}
                currentSort={
                  currentSortColumn
                    ? { columnKey: currentSortColumn, direction: sortOrder }
                    : undefined
                }
                onRowClick={handleRowClick}
                getRowKey={(row) => row.symbol}
                getRowId={(row) =>
                  String(row.securityId ?? `symbol-${row.symbol}`)
                }
                selectedRows={selectedSecurityIds.map(String)}
                selectedRowClassName="bg-brand-bg"
                isEqualGap
                density="compact"
                headerClassName="bg-transparent"
                contentPaddingX="px-14"
                cellGap="gap-[2px]"
                equalColumns
                headerTextClassName="text-blackinverse-a32"
                rowClassName="py-[8px]"
                headerCellClassName={(_key, isFirst) =>
                  isFirst ? 'pl-[8px] pr-[4px] py-[8px]' : 'px-[4px] py-[10px]'
                }
                rowCellClassName={(key, isFirst) => {
                  if (isFirst) return 'p-[4px]';
                  if (key === 'sparkline') return 'pl-0 pr-[4px] py-[4px]';
                  return 'px-[4px] py-0';
                }}
                rowActions={(row, isHovered) =>
                  isHovered ? (
                    <button
                      type="button"
                      aria-label={`${row.symbol} info`}
                      onClick={(e) => handleInfoClick(e, row)}
                      className="flex size-6 items-center justify-center rounded-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--blackinverse-a4)] hover:text-[var(--text-primary)]"
                    >
                      <InfoSharp sx={{ fontSize: 16 }} />
                    </button>
                  ) : null
                }
                virtualized={{
                  enabled: true,
                  estimateSize: 48,
                  overscan: 5,
                  onScrollEnd: () => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  },
                  scrollEndThreshold: 1,
                  isLoadingMore: isFetchingNextPage,
                }}
              />
            )}
          </div>
        </GlowBorder>
      </ModalBody>

      <ModalFooter
        align="right"
        className="!py-4 !pl-6 !pr-4"
        leftContent={
          selectedTickerObjects.length > 0 ? (
            <div className="flex items-center">
              {selectedTickerObjects.map((ticker, index) => (
                <div
                  key={ticker.symbol}
                  onClick={(e) => handleRemoveChip(e, ticker.symbol)}
                  className="relative w-6 h-6 shrink-0 cursor-pointer hover:z-10 transition-all group"
                  style={{ marginLeft: index === 0 ? 0 : -2 }}
                >
                  <div className="border-2 border-[var(--surfacegray-high)] rounded-full group-hover:opacity-0 transition-opacity">
                    <TickerIcon
                      securityId={ticker.securityId}
                      symbol={ticker.symbol}
                      size={24}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full border-2 border-[var(--surfacegray-high)] bg-[var(--blackinverse-a56)]">
                    <Icon
                      variant="closeSmall"
                      size={12}
                      className="text-[var(--surfacegray-high)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-[var(--text-secondary)] leading-4">
              {isBoardMode ? t('picker.boardHint') : t('picker.hint')}
            </p>
          )
        }
      >
        <GlowBorder active={tickerAddGlow} borderRadius={4} borderWidth={3}>
          <Button
            variant="secondary"
            size="md"
            onClick={handleContinue}
            disabled={selectedTickers.length === 0}
            icon={<Icon variant="arrowRight" size={20} />}
            iconSide="right"
          >
            {isBoardMode ? t('picker.add') : t('picker.continue')}
          </Button>
        </GlowBorder>
      </ModalFooter>
    </Modal>
  );
};

export default TickerPickerModal;

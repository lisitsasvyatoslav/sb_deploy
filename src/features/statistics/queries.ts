import { statisticsApi } from '@/services/api/statistics';
import type {
  BrokerPosition,
  BrokerPositionsFilterParams,
  BrokerTrade,
  BrokerTransaction,
  GroupedPositionsResponse,
  PaginatedResponse,
  PaginationParams,
  PeriodType,
  PortfolioValueHistoryResponse,
  SyncAllResponse,
  SyncProgress,
  TradesFilterParams,
  TransactionsFilterParams,
} from '@/types';
import {
  keepPreviousData,
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

/** Match backend BACKGROUND_SYNC_CONFIG.SYNC_INTERVAL_MINUTES */
const BACKGROUND_REFETCH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Query Keys - централизованное управление ключами кэша для statistics feature
 */
export const statisticsQueryKeys = {
  positions: (filters?: BrokerPositionsFilterParams) =>
    ['broker-positions', filters] as const,
  groupedPositions: (filters?: BrokerPositionsFilterParams) =>
    ['positions-grouped', filters] as const,
  brokerTrades: (filters?: TradesFilterParams, pagination?: PaginationParams) =>
    ['broker-trades', filters, pagination] as const,
  brokerTrade: (id: number) => ['broker-trade', id] as const,
  brokerTransactions: (
    filters?: TransactionsFilterParams,
    pagination?: PaginationParams
  ) => ['broker-transactions', filters, pagination] as const,
  brokerTransaction: (id: number) => ['broker-transaction', id] as const,
  portfolioHistory: (
    period: PeriodType,
    brokerType?: string | null,
    portfolioId?: number | null
  ) => ['portfolio-history', period, brokerType, portfolioId] as const,
};

/**
 * Query: Get positions calculated from broker trades with FIFO algorithm
 * Returns paginated response with positions grouped by (instrument, broker_type)
 *
 * @param filters - Position filters
 * @param options - Additional query options (e.g., enablePolling for initial data load)
 */
export const usePositionsQuery = (
  filters?: BrokerPositionsFilterParams,
  options?: { enablePolling?: boolean; hasAutoSync?: boolean }
): UseQueryResult<PaginatedResponse<BrokerPosition>, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.positions(filters),
    queryFn: () => statisticsApi.getPositions(filters),
    staleTime: 1000 * 60 * 2, // 2 минуты (обновляется при sync)
    refetchInterval: options?.enablePolling
      ? 10000
      : options?.hasAutoSync
        ? BACKGROUND_REFETCH_INTERVAL_MS
        : false,
  });
};

/**
 * Query: Get positions grouped by instrument → broker → account (V2)
 * Returns hierarchical structure with 3 levels for PositionsBlockV2 component
 *
 * @param filters - Position filters
 * @param options - Additional query options (e.g., enablePolling for initial data load)
 */
export const useGroupedPositionsQuery = (
  filters?: BrokerPositionsFilterParams,
  options?: { enablePolling?: boolean; hasAutoSync?: boolean }
): UseQueryResult<GroupedPositionsResponse, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.groupedPositions(filters),
    queryFn: () => statisticsApi.getGroupedPositions(filters),
    staleTime: 1000 * 60 * 2, // 2 минуты (обновляется при sync)
    refetchInterval: options?.enablePolling
      ? 10000
      : options?.hasAutoSync
        ? BACKGROUND_REFETCH_INTERVAL_MS
        : false,
  });
};

/**
 * Query: Get broker trades with pagination and filters
 */
export const useBrokerTradesQuery = (
  filters?: TradesFilterParams,
  pagination?: PaginationParams
): UseQueryResult<PaginatedResponse<BrokerTrade>, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.brokerTrades(filters, pagination),
    queryFn: () => statisticsApi.getTrades(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

/**
 * Query: Get specific broker trade
 */
export const useBrokerTradeQuery = (
  tradeId: number
): UseQueryResult<BrokerTrade, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.brokerTrade(tradeId),
    queryFn: () => statisticsApi.getTrade(tradeId),
    staleTime: 1000 * 60 * 5, // 5 минут
    enabled: !!tradeId,
  });
};

/**
 * Query: Get broker transactions with pagination and filters
 */
export const useBrokerTransactionsQuery = (
  filters?: TransactionsFilterParams,
  pagination?: PaginationParams
): UseQueryResult<PaginatedResponse<BrokerTransaction>, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.brokerTransactions(filters, pagination),
    queryFn: () => statisticsApi.getTransactions(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

/**
 * Query: Get specific broker transaction
 */
export const useBrokerTransactionQuery = (
  transactionId: number
): UseQueryResult<BrokerTransaction, Error> => {
  return useQuery({
    queryKey: statisticsQueryKeys.brokerTransaction(transactionId),
    queryFn: () => statisticsApi.getTransaction(transactionId),
    staleTime: 1000 * 60 * 5, // 5 минут
    enabled: !!transactionId,
  });
};

/**
 * Invalidate all statistics-related query caches.
 * Extracted as a standalone function so it can be called from Promise chains
 * (e.g. .then()) which fire regardless of React component lifecycle,
 * unlike useMutation onSuccess callbacks that require the component to be mounted.
 */
export function invalidateAllStatisticsQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['broker-positions'] });
  queryClient.invalidateQueries({ queryKey: ['positions-grouped'] });
  queryClient.invalidateQueries({ queryKey: ['broker-trades'] });
  queryClient.invalidateQueries({ queryKey: ['broker-transactions'] });
  queryClient.invalidateQueries({ queryKey: ['portfolio-history'] });
  // Matches portfolioCatalogQueryKeys — hardcoded to avoid cross-feature import
  queryClient.invalidateQueries({ queryKey: ['portfolios', 'with-summary'] });
  queryClient.invalidateQueries({ queryKey: ['accounts', 'summary'] });
}

/**
 * Mutation: Sync all active trading accounts
 */
export const useSyncAllMutation = (): UseMutationResult<
  SyncAllResponse,
  Error,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => statisticsApi.syncAll(),
    onSuccess: () => invalidateAllStatisticsQueries(queryClient),
  });
};

/**
 * Query: Poll real-time sync progress while a sync is running.
 * Refetches every 2 seconds only when `enabled` is true.
 */
export const useSyncProgressQuery = (
  enabled: boolean
): UseQueryResult<SyncProgress, Error> => {
  return useQuery({
    queryKey: ['sync-progress'],
    queryFn: () => statisticsApi.getSyncProgress(),
    enabled,
    refetchInterval: enabled ? 2000 : false,
    staleTime: 0,
  });
};

/**
 * Query: Get portfolio value history
 */
export const usePortfolioValueHistoryQuery = (
  options: {
    period?: PeriodType;
    brokerType?: string | null;
    portfolioId?: number | null;
  } = {}
): UseQueryResult<PortfolioValueHistoryResponse, Error> => {
  const { period = 'all', brokerType, portfolioId } = options;
  return useQuery({
    queryKey: statisticsQueryKeys.portfolioHistory(
      period,
      brokerType,
      portfolioId
    ),
    queryFn: () =>
      statisticsApi.getPortfolioValueHistory({
        period,
        brokerType,
        portfolioId,
      }),
    staleTime: 1000 * 60 * 5, // 5 минут
    placeholderData: keepPreviousData, // Keep old chart visible during period switch
  });
};

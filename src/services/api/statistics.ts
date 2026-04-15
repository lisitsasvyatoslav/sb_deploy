import { apiClient } from '@/services/api/client';
import type {
  BrokerPosition,
  BrokerPositionsFilterParams,
  BrokerTrade,
  BrokerTransaction,
  GroupedPositionsResponse,
  PaginatedResponse,
  PaginationParams,
  PortfolioValueHistoryResponse,
  SyncAllResponse,
  SyncProgress,
  TradesFilterParams,
  TransactionsFilterParams,
} from '@/types';

type ApiParams = Record<string, string | number | string[] | undefined | null>;

/**
 * Build query params shared by getPositions and getGroupedPositions.
 */
function buildPositionsParams(
  filters: BrokerPositionsFilterParams | undefined,
  defaults: { sortBy: string; pageSize: number }
): ApiParams {
  const params: ApiParams = {
    status: filters?.status || 'all',
    search: filters?.search,
    instrument: filters?.instrument,
    brokerType: filters?.brokerType,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
    sortBy: filters?.sortBy || defaults.sortBy,
    sortOrder: filters?.sortOrder || 'desc',
    page: filters?.page || 1,
    pageSize: filters?.pageSize || defaults.pageSize,
  };

  if (filters?.portfolioId != null) {
    params.portfolioId = filters.portfolioId;
  }

  if (filters?.accountIds !== undefined && filters.accountIds !== null) {
    if (filters.accountIds.length === 0) {
      params.accountIds = 'none';
    } else {
      params.accountIds = filters.accountIds;
    }
  }

  // Remove undefined/null params
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });

  return params;
}

/**
 * Statistics API client
 * Endpoints: /api/statistics/*
 */
export const statisticsApi = {
  // ====================
  // Positions (MAIN)
  // ====================

  /**
   * GET /api/statistics/positions
   * Get positions calculated from broker trades with FIFO algorithm
   * Returns paginated response with positions grouped by (instrument, brokerType)
   */
  async getPositions(
    filters?: BrokerPositionsFilterParams
  ): Promise<PaginatedResponse<BrokerPosition>> {
    const params = buildPositionsParams(filters, {
      sortBy: 'opened_at',
      pageSize: 10,
    });
    const response = await apiClient.get('/statistics/positions', { params });
    return response.data;
  },

  /**
   * GET /api/statistics/positions/grouped-by-instrument
   * Get positions grouped by instrument → broker → account (V2)
   * Returns hierarchical structure with 3 levels for PositionsBlockV2 component
   */
  async getGroupedPositions(
    filters?: BrokerPositionsFilterParams
  ): Promise<GroupedPositionsResponse> {
    const params = buildPositionsParams(filters, {
      sortBy: 'last_trade_at',
      pageSize: 50,
    });
    const response = await apiClient.get(
      '/statistics/positions/grouped-by-instrument',
      { params }
    );
    return response.data;
  },

  // ====================
  // Broker Trades (for drill-down)
  // ====================

  /**
   * GET /api/statistics/trades
   * Get broker trades with pagination and filters
   */
  async getTrades(
    filters?: TradesFilterParams,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<BrokerTrade>> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/statistics/trades', { params });
    return response.data;
  },

  /**
   * GET /api/statistics/trades/{trade_id}
   * Get specific broker trade
   */
  async getTrade(tradeId: number): Promise<BrokerTrade> {
    const response = await apiClient.get(`/statistics/trades/${tradeId}`);
    return response.data;
  },

  /**
   * GET /api/statistics/positions/{id}/trades
   * Get trades linked to a specific position via trade_position_links
   */
  async getPositionTrades(positionId: number): Promise<{
    positionId: number;
    symbol: string;
    brokerType: string;
    trades: Array<{
      unifiedTradeId: number;
      brokerTradeId?: number;
      role: string;
      quantity: string;
      side: string;
      price: string;
    }>;
  }> {
    const response = await apiClient.get(
      `/statistics/positions/${positionId}/trades`
    );
    return response.data;
  },

  // ====================
  // Broker Transactions
  // ====================

  /**
   * GET /api/statistics/transactions
   * Get broker transactions with pagination and filters
   */
  async getTransactions(
    filters?: TransactionsFilterParams,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<BrokerTransaction>> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/statistics/transactions', {
      params,
    });
    return response.data;
  },

  /**
   * GET /api/statistics/transactions/{transaction_id}
   * Get specific broker transaction
   */
  async getTransaction(transactionId: number): Promise<BrokerTransaction> {
    const response = await apiClient.get(
      `/statistics/transactions/${transactionId}`
    );
    return response.data;
  },

  // ====================
  // Synchronization
  // ====================

  /**
   * POST /api/statistics/sync/all
   * Sync all active trading accounts
   */
  async syncAll(): Promise<SyncAllResponse> {
    const response = await apiClient.post('/statistics/sync/all');
    return response.data;
  },

  /**
   * GET /api/statistics/sync/progress
   * Real-time sync progress for the current user.
   * Poll while isDataSyncInProgress=true.
   */
  async getSyncProgress(): Promise<SyncProgress> {
    const response = await apiClient.get('/statistics/sync/progress');
    return response.data;
  },

  // ====================
  // Portfolio Value History
  // ====================

  /**
   * GET /api/statistics/portfolio/history
   * Get historical portfolio value over time
   */
  async getPortfolioValueHistory(params: {
    period: string;
    brokerType?: string | null;
    portfolioId?: number | null;
  }): Promise<PortfolioValueHistoryResponse> {
    const queryParams: Record<string, string> = {
      period: params.period,
    };

    if (params.brokerType) {
      queryParams.brokerType = params.brokerType;
    }

    if (params.portfolioId != null) {
      queryParams.portfolioId = String(params.portfolioId);
    }

    const response = await apiClient.get('/statistics/portfolio/history', {
      params: queryParams,
    });
    return response.data;
  },

  // ====================
  // Accounts Summary
  // ====================

  /**
   * GET /api/statistics/accounts/summary
   * Aggregated market value per broker/account from latest snapshot
   */
  async getAccountsSummary(): Promise<
    Array<{
      brokerType: string;
      connectionId: number | null;
      accountId: string | null;
      marketValue: number;
      currency: string | null;
    }>
  > {
    const response = await apiClient.get('/statistics/accounts/summary');
    return response.data;
  },
};

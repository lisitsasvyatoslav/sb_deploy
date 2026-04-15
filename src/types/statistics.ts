// Trading statistics and analysis types
// TODO: refactor this file
export interface TradingStatistics {
  activePositions: number;
  closedPositions: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

// ==============================================================================
// Broker-based Statistics (from broker API sync)
// ==============================================================================

/**
 * ExchangeDetail - детализация позиции по конкретной бирже
 */
export interface ExchangeDetail {
  exchange: string; // Код биржи (MISX, SPB, etc.)
  symbol: string; // Полный символ с биржей (SBER@MISX)
  quantity: string; // Количество на бирже (Decimal as string)
  avgOpenPrice: string | null; // Средняя цена открытия на бирже (FIFO)
  currentPrice: string | null; // Текущая цена на бирже (live data)
  unrealizedPnlMoney: string | null; // Нереализ. P&L в деньгах для биржи
  unrealizedPnlPct: string | null; // Нереализ. P&L в % для биржи
  currency?: string; // Валюта инструмента (RUB, USD, etc.)
}

/**
 * BrokerPosition (calculated from broker trades with FIFO algorithm)
 * Main type for PositionsTable
 *
 * Grouped by (instrument, broker_type)
 * FIFO calculated separately for each exchange
 */
export interface BrokerPosition {
  instrument: string; // Инструмент (VTBR, SBER, etc.) без биржи
  securityId?: number; // Security ID для загрузки иконки
  brokerType: string; // 'finam', 'mt5', etc.
  status: 'open' | 'closed'; // Открытая / Закрытая позиция

  // FIFO метрики (агрегированные по всем биржам)
  totalQuantity: string; // Общее количество (Decimal as string)
  avgOpenPrice: string; // Средневзвешенная цена открытия (FIFO)
  avgClosePrice: string | null; // Средняя цена закрытия

  // Онлайн данные (live data from Finam GetAccount API)
  currentPrice: string | null; // Взвешенная средняя текущая цена по биржам
  currency?: string; // Валюта инструмента (RUB, USD, etc.)

  // P&L метрики (в процентах, live data)
  realizedPnl: string | null; // Реализованная прибыль (для закрытых)
  unrealizedPnlTodayPct: string | null; // Нереализ. прибыль за день (%)
  unrealizedPnlTotalPct: string | null; // Нереализ. прибыль за все время (%)

  // Метаданные
  exchangesCount: number; // Количество бирж (MOEX, SPB, etc.)
  exchangeDetails: ExchangeDetail[]; // Детализация по биржам
  openedAt: string; // Время первой покупки (ISO datetime)
  closedAt: string | null; // Время последней продажи при полном закрытии (ISO datetime)
  lastTradeAt: string | null; // Время последней сделки любого типа (ISO datetime)

  // Тип инструмента
  instrumentType?: string; // Тип инструмента (stock, bond, currency, etc.)

  // Phase 2 (later):
  // cardId?: number | null;        // Связь с торговой идеей
}

/**
 * Broker Trade (individual trade execution)
 * Matches backend BrokerTradeResponse schema
 */
export interface BrokerTrade {
  id: number;
  accountId: string; // Broker account ID (string, not FK)
  userId: string; // User ID
  tradeId: string; // Broker's trade ID
  orderId: string | null; // Broker's order ID
  symbol: string; // Ticker symbol
  side: 'buy' | 'sell'; // Trade direction
  price: string; // Decimal as string
  size: string; // Decimal as string (quantity)
  timestamp: string; // ISO datetime
  brokerType: string; // 'finam', 'mt5', etc.
  dataSource: string; // Data source identifier
  cardId: number | null; // Link to trading idea
  notes: string | null; // User notes
  tags: string | null; // User tags
  createdAt: string; // ISO datetime
}

/**
 * Broker Transaction (commissions, taxes, deposits, etc.)
 * Matches backend BrokerTransactionResponse schema
 */
export interface BrokerTransaction {
  id: number;
  accountId: string; // Broker account ID (string, not FK)
  userId: string; // User ID
  transactionId: string; // Broker's transaction ID
  category: string; // INCOME, COMMISSION, TAX, DEPOSIT, WITHDRAWAL, OTHER
  transactionName: string | null;
  timestamp: string; // ISO datetime
  symbol: string | null; // Related symbol (if any)
  amount: string; // Decimal as string
  currency: string; // Currency code (RUB, USD, etc.)
  brokerType: string; // 'finam', 'mt5', etc.
  createdAt: string; // ISO datetime
}

// ==============================================================================
// Filters
// ==============================================================================

export interface BrokerPositionsFilterParams {
  status?: 'open' | 'closed' | 'all';
  search?: string | null; // Search: instrument (sber), symbol+exchange (sber@moex), broker (finam) - case-insensitive
  instrument?: string | null; // Filter by exact instrument ticker
  brokerType?: string | null; // Filter by broker type
  accountIds?: string[] | null; // Filter by account IDs
  portfolioId?: number | null; // Filter by portfolio ID
  dateFrom?: string | null; // ISO date
  dateTo?: string | null; // ISO date
  sortBy?: 'opened_at' | 'last_trade_at' | 'instrument';
  sortOrder?: 'asc' | 'desc';
  page?: number; // Page number (1-based)
  pageSize?: number; // Items per page
}

export interface TradesFilterParams {
  accountIds?: string[] | null;
  symbol?: string | null;
  side?: 'buy' | 'sell' | null;
  fromDate?: string | null; // ISO date
  toDate?: string | null; // ISO date
}

export interface TransactionsFilterParams {
  accountId?: string | null;
  category?: string | null;
  fromDate?: string | null; // ISO date
  toDate?: string | null; // ISO date
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ==============================================================================
// Pagination
// ==============================================================================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ==============================================================================
// Sync Results
// ==============================================================================

export interface SyncAllResponse {
  status: string;
  accountsSynced: number;
  results: AccountSyncResult[];
  demoDataInjected?: boolean;
}

export interface AccountSyncResult {
  accountId: string;
  status: string;
  trades?: TradesSyncResult;
  transactions?: TransactionsSyncResult;
  error?: string;
}

export interface TradesSyncResult {
  tradesFetched: number;
  isInitialSync: boolean;
  syncPeriod: {
    from: string;
    to: string;
  };
}

export interface TransactionsSyncResult {
  transactionsFetched: number;
  isInitialSync: boolean;
  syncPeriod?: {
    from: string;
    to: string;
  };
}

// ==============================================================================
// Portfolio Value History
// ==============================================================================

export type PeriodType = '2d' | '1w' | '1m' | '6m' | '1y' | '3y' | 'all';

export interface PortfolioValuePoint {
  date: string; // ISO format date
  value: number | null; // Total portfolio value (null if no data for this period)
  instrumentsValue?: number | null; // Value of instruments only
  cash?: number | null; // Cash balance
  isForwardFilled?: boolean; // True if this data point was forward-filled from previous day
}

export interface PortfolioValueHistoryResponse {
  period: string; // Requested period (2d, 1w, 1m, etc.)
  timeframe: string; // Bar timeframe (1H, 4H, 1D, 1W, 1MN, 1QR)
  dateFrom: string | null; // Start date
  dateTo: string | null; // End date
  byBroker: Record<string, PortfolioValuePoint[]>; // Portfolio value by broker
}

// ==============================================================================
// Hierarchical Grouped Positions (V2) - 3-level structure
// ==============================================================================

/**
 * Level 3: Individual account position
 * Represents a single trading account's position for a specific instrument
 */
export interface AccountPosition {
  positionIds?: number[];
  accountId: string;
  accountName?: string;
  exchange: string;
  symbol: string;
  quantity: string;
  avgOpenPrice?: string;
  currentPrice?: string;
  realizedPnl?: string;
  unrealizedPnlMoney?: string;
  unrealizedPnlPct?: string;
  status: 'open' | 'closed';
  openedAt: string;
  lastTradeAt?: string;
  closedAt?: string;
  currency?: string;
}

/**
 * Level 2: Broker group
 * Aggregates all accounts for a specific broker holding this instrument
 */
export interface BrokerGroup {
  brokerType: string;
  accountsCount: number;
  totalQuantity: string;
  avgOpenPrice: string;
  currentPrice?: string;
  totalRealizedPnl: string;
  totalUnrealizedPnlMoney?: string;
  unrealizedPnlPct?: string;
  openedAt: string;
  lastTradeAt?: string;
  currency?: string;
  accounts: AccountPosition[];
}

/**
 * Level 1: Instrument group
 * Top-level aggregation by instrument across all brokers
 */
export interface InstrumentGroup {
  instrument: string;
  securityId?: number;
  iconUrl?: string;
  brokersCount: number;
  totalQuantity: string;
  avgOpenPrice: string;
  currentPrice?: string;
  totalRealizedPnl: string;
  totalUnrealizedPnlMoney?: string;
  unrealizedPnlPct?: string;
  openedAt: string;
  lastTradeAt?: string;
  currency?: string;
  brokers: BrokerGroup[];
}

/**
 * Paginated response for grouped positions
 */
export interface GroupedPositionsResponse {
  data: InstrumentGroup[];
  pagination: PaginationInfo;
}

/**
 * Real-time sync progress returned by GET /api/statistics/sync/progress
 */
export interface SyncProgress {
  isInProgress: boolean;
  completed: number;
  total: number;
}

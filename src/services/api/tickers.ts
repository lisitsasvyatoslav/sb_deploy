import { apiClient } from '@/services/api/client';
import {
  FundamentalData,
  FundamentalMetric,
  NewsArticle,
  SparklineDataPoint,
  TechnicalAnalysisData,
  TechnicalIndicator,
  Ticker,
  TickerBatchItem,
  TickerBatchResponse,
  TickerCategory,
} from '@/types/ticker';
import { logger } from '@/shared/utils/logger';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import { currentRegionConfig, REGION } from '@/shared/config/region';
// Analytics tab configuration — hide news tab for US region
const ALL_ANALYTICS_TABS = [
  { label: 'News', value: 'news' as const },
  { label: 'Fundamental', value: 'fundamental' as const },
  { label: 'Tech analysis', value: 'techanalysis' as const },
];

export const ANALYTICS_TABS =
  REGION === 'us'
    ? ALL_ANALYTICS_TABS.filter((tab) => tab.value !== 'news')
    : ALL_ANALYTICS_TABS;

/**
 * Ticker API Service
 * Integrates with backend /api/ticker endpoints
 */

export interface TickerListItemBackend {
  security_id: number;
  ticker: string;
  name: string;
  slug: string;
  mic: string;
  currency?: string; // Optional - can be null for some crypto tickers
  sector?: string;
  price?: number;
  change_percent?: number;
  change_abs?: number;
  year_change_percent?: number;
  year_change_abs?: number;
  market_cap?: number;
  sparkline: Array<{ x: number; y: number }>;
}

interface TickerListResponseBackend {
  tickers: TickerListItemBackend[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ScreenerResult {
  security_id: number;
  ticker: string;
  name: string;
  slug: string;
  currency?: string | null;
  quote_last?: number | null;
  quote_change_percent?: number | null;
  forecast_step_target?: number | null;
  forecast_step_change?: number | null;
  max_drawdown?: number | null;
  volatility_score?: number | null;
  sharpe_ratio?: number | null;
  growth_potential_pct?: number | null;
  updated_at?: string | null;
}

interface ScreenerResponseBackend {
  results: ScreenerResult[];
  total: number;
  filters_applied: Record<string, number>;
}

interface MarketBackend {
  id: number;
  type?: number;
  title: string;
}

interface MarketResponseBackend {
  markets: MarketBackend[];
  total: number;
}

/**
 * Map backend TickerListItem to frontend Ticker type
 */
export const mapTickerFromBackend = (
  backendTicker: TickerListItemBackend
): Ticker => {
  // Convert sparkline from {x, y} format to {date, value} format
  // Backend provides only indices (x) and prices (y), so we use empty date string
  // SparklineChart component supports empty dates for old format data
  const sparklineData: SparklineDataPoint[] = (
    backendTicker.sparkline ?? []
  ).map((point) => ({
    date: '', // Empty date - backend doesn't provide dates for list view sparklines
    value: point.y,
  }));

  return {
    id: String(backendTicker.security_id),
    name: backendTicker.name,
    symbol: backendTicker.ticker,
    securityId: backendTicker.security_id,
    price: backendTicker.price ?? 0,
    priceChange: backendTicker.change_abs ?? 0,
    priceChangePercent: backendTicker.change_percent ?? 0,
    yearlyChange: backendTicker.year_change_abs ?? 0,
    yearlyChangePercent: backendTicker.year_change_percent ?? 0,
    sparkline: sparklineData,
    category: backendTicker.mic, // Use mic as category for filtering
    currency:
      backendTicker.currency && backendTicker.currency.toUpperCase() !== 'XXX'
        ? backendTicker.currency
        : currentRegionConfig.baseCurrency,
  };
};

/**
 * Helper: Fetch tickers by symbols and return as Map for quick lookup
 */
const fetchTickersMap = async (
  symbols: string[]
): Promise<Map<string, Ticker>> => {
  const tickers = await tickersApi.getTickersBySymbols(symbols);
  return new Map(tickers.map((t) => [t.symbol, t]));
};

export const tickersApi = {
  /**
   * Get tickers with optional search, market filter, pagination, and sorting
   */
  getTickers: async (params?: {
    search?: string;
    market?: number;
    type?: number;
    page?: number;
    limit?: number;
    sort?: string;
    ordering?: string;
    security_ids?: number[]; // Filter by security IDs
  }): Promise<Ticker[]> => {
    const queryParams: Record<string, string | number> = {};

    if (params?.search) {
      queryParams.search = params.search;
    }

    if (params?.market !== undefined) {
      queryParams.market = params.market;
    }

    if (params?.type !== undefined) {
      queryParams.type = params.type;
    }

    if (params?.page) {
      queryParams.page = params.page;
    }

    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    if (params?.sort) {
      queryParams.sort_by = params.sort;
    }

    if (params?.ordering) {
      queryParams.sort_order = params.ordering;
    }

    if (params?.security_ids && params.security_ids.length > 0) {
      queryParams.security_ids = params.security_ids.join(',');
    }

    const response = await apiClient.get<TickerListResponseBackend>('/ticker', {
      params: queryParams,
    });

    return response.data.tickers.map(mapTickerFromBackend);
  },

  /**
   * Get tickers by symbols in batch (single request)
   */
  getTickersBySymbols: async (symbols: string[]): Promise<Ticker[]> => {
    if (symbols.length === 0) return [];

    try {
      const response = await apiClient.post<{ tickers: TickerBatchItem[] }>(
        '/ticker/batch',
        { symbols }
      );

      return (response.data.tickers || []).map((t) => ({
        id: String(t.security_id),
        symbol: t.asset_ticker,
        name: t.asset_name,
        securityId: t.security_id,
        price: t.quote_last ?? 0,
        priceChange: t.quote_change ?? 0,
        priceChangePercent: t.quote_change_percent ?? 0,
        yearlyChange: 0,
        yearlyChangePercent: 0,
        sparkline: [],
        currency: t.asset_currency,
        category: t.asset_mic ?? '',
      }));
    } catch (error) {
      logger.error('tickersApi', 'Failed to fetch tickers by symbols', error);
      return [];
    }
  },

  /**
   * Get available markets from backend
   */
  getMarkets: async (): Promise<TickerCategory[]> => {
    const response =
      await apiClient.get<MarketResponseBackend>('/ticker/markets');

    // Map markets to tab format
    // "popular" is special - no filter
    const markets: TickerCategory[] = [{ label: 'Popular', value: 'popular' }];

    // Add each market as a tab option with ID as value
    response.data.markets.forEach((market) => {
      markets.push({
        label: market.title,
        value: String(market.id), // Use market ID as value
      });
    });

    return markets;
  },

  /**
   * Search tickers by query
   */
  searchTickers: async (query: string): Promise<Ticker[]> => {
    return tickersApi.getTickers({
      search: query,
      page: 1,
      limit: 100,
    });
  },

  /**
   * Get tickers by market
   */
  getTickersByMarket: async (market: string): Promise<Ticker[]> => {
    // "popular" means no filter
    if (market === 'popular') {
      return tickersApi.getTickers({
        page: 1,
        limit: 100,
      });
    }

    // Market value is the market ID (1, 5, 6, 7, 8)
    const marketId = Number(market);

    // Special handling for Crypto (market 5) - requires type=7
    if (marketId === 5) {
      return tickersApi.getTickers({
        market: marketId,
        type: 7, // Crypto type
        page: 1,
        limit: 100,
      });
    }

    return tickersApi.getTickers({
      market: marketId,
      page: 1,
      limit: 100,
    });
  },

  /**
   * Get news articles
   */
  getNews: async (): Promise<NewsArticle[]> => {
    // Not implemented - use getNewsByTickers instead
    return [];
  },

  /**
   * Get news by ticker symbols
   * Uses security_id to fetch news from backend
   */
  getNewsByTickers: async (tickerSymbols: string[]): Promise<NewsArticle[]> => {
    if (tickerSymbols.length === 0) return [];

    try {
      const tickerMap = await fetchTickersMap(tickerSymbols);

      // Fetch news for each ticker
      const newsPromises = tickerSymbols.map(async (symbol) => {
        const ticker = tickerMap.get(symbol);
        if (!ticker) {
          logger.warn('tickersApi', `Ticker ${symbol} not found in database`);
          return [];
        }

        try {
          const response = await apiClient.get<{
            news: Array<{
              id: string;
              title: string;
              content?: string;
              description?: string;
              url?: string;
              source?: string;
              published_at?: string;
              sentiment?: string;
            }>;
            total: number;
            security_id: number;
          }>('/ticker/news', {
            params: {
              security_id: ticker.securityId,
            },
          });

          // Map backend news to frontend format
          return response.data.news.map((newsItem, index) => {
            const publishedDateStr = newsItem.published_at;
            const publishedDate = publishedDateStr
              ? new Date(publishedDateStr)
              : null;
            const isValidDate =
              publishedDate !== null && !isNaN(publishedDate.getTime());
            const newsDateLocale = getDateLocaleTag();
            const dateStr = isValidDate
              ? publishedDate!.toLocaleDateString(newsDateLocale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '';
            const timeStr = isValidDate
              ? publishedDate!.toLocaleTimeString(newsDateLocale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return {
              id: newsItem.id || `${symbol}-news-${index}`,
              tickerSymbol: symbol,
              securityId: ticker.securityId,
              headline: newsItem.title,
              date: dateStr,
              time: timeStr,
              source: newsItem.source || 'Unknown',
              url: newsItem.url,
              content: newsItem.content,
              timestamp: publishedDateStr || undefined,
            } as NewsArticle;
          });
        } catch (error) {
          logger.error(
            'tickersApi',
            `Failed to fetch news for ${symbol} (security_id ${ticker.securityId})`,
            error
          );
          return [];
        }
      });

      const newsArrays = await Promise.all(newsPromises);
      return newsArrays.flat();
    } catch (error) {
      logger.error('tickersApi', 'Error fetching news by tickers', error);
      return [];
    }
  },

  /**
   * Get fundamental data
   */
  getFundamentalData: async (): Promise<FundamentalData[]> => {
    // Not implemented - use getFundamentalDataByTickers instead
    return [];
  },

  /**
   * Get fundamental data by ticker symbols
   */
  getFundamentalDataByTickers: async (
    tickerSymbols: string[]
  ): Promise<FundamentalData[]> => {
    if (tickerSymbols.length === 0) return [];

    try {
      const tickerMap = await fetchTickersMap(tickerSymbols);

      // Fetch fundamental data for each ticker
      const fundamentalPromises = tickerSymbols.map(async (symbol) => {
        const ticker = tickerMap.get(symbol);
        if (!ticker) {
          logger.warn('tickersApi', `Ticker ${symbol} not found in database`);
          return null;
        }

        const tickerSlug = `${ticker.category}:${ticker.symbol}`;

        try {
          const response = await apiClient.get<
            Record<string, FundamentalMetric | null>
          >(`/ticker/${encodeURIComponent(tickerSlug)}/fundamental`);

          const data = response.data;

          // Return all fields including new detailed metrics
          return {
            id: `${symbol}-fundamental`,
            tickerSymbol: symbol,
            tickerName: ticker.name,
            securityId: ticker.securityId,
            currency: ticker.currency || currentRegionConfig.baseCurrency,

            // Legacy simple fields for backward compatibility (used in list view)
            pe: data.pe_ratio?.value ?? 0,

            // New detailed metric objects (used in modal)
            peRatio: data.pe_ratio,
            priceBook: data.price_book,
            priceSales: data.price_sales,
            priceCf: data.price_cf,
            priceFcf: data.price_fcf,

            debtRatio: data.debt_ratio,
            debtEquity: data.debt_equity,
            capexRevenue: data.capex_revenue,

            roe: data.roe,
            roa: data.roa,
            roi: data.roi,
            netMargin: data.net_margin,

            dividends: data.dividends,
            netIncome: data.net_income,
            ebitda: data.ebitda,
            operatingIncome: data.operating_income,
            grossProfit: data.gross_profit,
            sharesOutstanding: data.shares_outstanding,
            totalAssets: data.total_assets,
            cashOnHand: data.cash_on_hand,

            longTermDebt: data.long_term_debt,
            totalLiabilities: data.total_liabilities,
            totalShareholderEquity: data.total_shareholder_equity,

            operatingCashFlow: data.operating_cash_flow,
            freeCashFlow: data.free_cash_flow,
            capex: data.capex,

            revenue: data.revenue,
            marketCapitalization: data.market_capitalization,
            dividendYield: data.dividend_yield,
          } as FundamentalData;
        } catch (error) {
          logger.error(
            'tickersApi',
            `Failed to fetch fundamental data for ${tickerSlug}`,
            error
          );
          return null;
        }
      });

      const fundamentalResults = await Promise.all(fundamentalPromises);
      return fundamentalResults.filter(
        (item): item is FundamentalData => item !== null
      );
    } catch (error) {
      logger.error('tickersApi', 'Error fetching fundamental data', error);
      return [];
    }
  },

  /**
   * Get technical analysis data
   */
  getTechnicalData: async (): Promise<TechnicalAnalysisData[]> => {
    // Not implemented - use getTechnicalDataByTickers instead
    return [];
  },

  /**
   * Get technical analysis data by ticker symbols
   */
  getTechnicalDataByTickers: async (
    tickerSymbols: string[]
  ): Promise<TechnicalAnalysisData[]> => {
    if (tickerSymbols.length === 0) return [];

    try {
      const tickerMap = await fetchTickersMap(tickerSymbols);

      // Fetch technical analysis for each ticker
      const technicalPromises = tickerSymbols.map(async (symbol) => {
        const ticker = tickerMap.get(symbol);
        if (!ticker) {
          logger.warn('tickersApi', `Ticker ${symbol} not found in database`);
          return null;
        }

        const tickerSlug = `${ticker.category}:${ticker.symbol}`;

        try {
          const response = await apiClient.get<{
            ticker: string;
            // Backend may return either camelCase or snake_case
            trendClass?: string;
            trend_class?: string;
            trendPower?: string;
            trend_power?: string;
            pattern?: string;
            indicators: Array<{
              name: string;
              value?: number;
              format?: string; // "price", "percent", "number"
              signal?: string;
              description?: string;
            }>;
            summary?: string;
          }>(`/ticker/${encodeURIComponent(tickerSlug)}/ta`);

          const data = response.data;

          // Map backend indicators to frontend format
          const indicators: TechnicalIndicator[] = data.indicators.map(
            (ind) => ({
              name: ind.name,
              value: ind.value,
              format:
                (ind.format as 'price' | 'percent' | 'number') || 'number',
              signal: (ind.signal as 'buy' | 'sell' | 'neutral') || undefined,
              description: ind.description,
            })
          );

          return {
            id: `${symbol}-technical`,
            tickerSymbol: symbol,
            tickerName: ticker.name,
            securityId: ticker.securityId,
            trendClass: data.trendClass ?? data.trend_class,
            trendPower: data.trendPower ?? data.trend_power,
            pattern: data.pattern || undefined,
            indicators,
            summary: data.summary,
          } as TechnicalAnalysisData;
        } catch (error) {
          logger.error(
            'tickersApi',
            `Failed to fetch technical analysis for ${tickerSlug}`,
            error
          );
          return null;
        }
      });

      const technicalResults = await Promise.all(technicalPromises);
      return technicalResults.filter(
        (item): item is TechnicalAnalysisData => item !== null
      );
    } catch (error) {
      logger.error('tickersApi', 'Error fetching technical analysis', error);
      return [];
    }
  },

  /**
   * Get AI Screener results with filters
   */
  getScreenerResults: async (params: {
    min_potential?: number;
    max_volatility?: number;
    min_sharpe?: number;
    max_drawdown?: number;
    limit?: number;
    market?: string;
  }): Promise<ScreenerResult[]> => {
    const response = await apiClient.get<ScreenerResponseBackend>(
      '/ticker/screener',
      {
        params,
      }
    );
    return response.data.results;
  },

  /**
   * Get analytics tabs configuration
   */
  getAnalyticsTabs: async () => {
    return ANALYTICS_TABS;
  },

  /**
   * Get fresh chart card data for a ticker by security_id
   * This endpoint fetches current market data with caching (5 min)
   */
  getChartCardData: async (
    security_id: number,
    period = 'Q'
  ): Promise<{
    security_id: number;
    ticker: string;
    name: string;
    slug: string;
    price: number;
    priceChange: number;
    priceChangePercent: number;
    yearlyChange: number;
    yearlyChangePercent: number;
    sparkline: SparklineDataPoint[];
    currency: string;
    category: string;
    lastUpdate: string;
  }> => {
    const response = await apiClient.get(`/ticker/chart/${security_id}`, {
      params: { period },
    });
    return response.data;
  },

  getTickerBatch: async (tickers: string[]): Promise<TickerBatchResponse> => {
    const response = await apiClient.post<TickerBatchResponse>(
      '/ticker/batch',
      {
        symbols: tickers,
      }
    );
    return response.data;
  },
};

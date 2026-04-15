import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { tickersApi } from '@/services/api/tickers';

/**
 * Query Keys - централизованное управление ключами кэша для ticker feature
 */
export const tickerQueryKeys = {
  all: ['tickers'] as const,
  batch: (symbols: string[]) =>
    [...tickerQueryKeys.all, 'batch', [...symbols].sort()] as const,
  tickers: (params?: {
    search?: string;
    market?: number;
    type?: number;
    page?: number;
    limit?: number;
    sort?: string;
    ordering?: string;
    security_ids?: number[];
  }) => [...tickerQueryKeys.all, 'list', params] as const,
  markets: () => [...tickerQueryKeys.all, 'markets'] as const,
  search: (query: string) => [...tickerQueryKeys.all, 'search', query] as const,
  byMarket: (market: string) =>
    [...tickerQueryKeys.all, 'market', market] as const,
  news: () => [...tickerQueryKeys.all, 'news'] as const,
  newsByTickers: (symbols: string[]) =>
    [...tickerQueryKeys.all, 'news', symbols] as const,
  fundamental: () => [...tickerQueryKeys.all, 'fundamental'] as const,
  fundamentalByTickers: (symbols: string[]) =>
    [...tickerQueryKeys.all, 'fundamental', symbols] as const,
  technical: () => [...tickerQueryKeys.all, 'technical'] as const,
  technicalByTickers: (symbols: string[]) =>
    [...tickerQueryKeys.all, 'technical', symbols] as const,
  analyticsTabs: () => [...tickerQueryKeys.all, 'analytics-tabs'] as const,
};

/**
 * Query: Загрузка тикеров с опциональными параметрами
 */
export const useTickersQuery = (params?: {
  search?: string;
  market?: number;
  type?: number;
  page?: number;
  limit?: number;
  sort?: string;
  ordering?: string;
  security_ids?: number[]; // Filter by security IDs for loading selected tickers
  enabled?: boolean; // Allow disabling the query
}) => {
  const { enabled = true, ...apiParams } = params || {};
  return useQuery({
    queryKey: tickerQueryKeys.tickers(apiParams),
    queryFn: () => tickersApi.getTickers(apiParams),
    staleTime: 1000 * 60 * 5, // 5 минут
    enabled,
  });
};

/**
 * Query: Загрузка доступных бирж (markets)
 */
export const useMarketsQuery = () => {
  return useQuery({
    queryKey: tickerQueryKeys.markets(),
    queryFn: () => tickersApi.getMarkets(),
    staleTime: 1000 * 60 * 10, // 10 минут - биржи редко меняются
  });
};

/**
 * Query: Поиск тикеров
 */
export const useSearchTickersQuery = (query: string, enabled = true) => {
  return useQuery({
    queryKey: tickerQueryKeys.search(query),
    queryFn: () => tickersApi.searchTickers(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60, // 1 минута
  });
};

/**
 * Query: Загрузка тикеров по бирже (market)
 */
export const useTickersByMarketQuery = (market: string) => {
  return useQuery({
    queryKey: tickerQueryKeys.byMarket(market),
    queryFn: () => tickersApi.getTickersByMarket(market),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

/**
 * Query: Загрузка всех новостей
 */
export const useNewsQuery = () => {
  return useQuery({
    queryKey: tickerQueryKeys.news(),
    queryFn: () => tickersApi.getNews(),
    staleTime: 1000 * 60, // 1 минута - новости обновляются часто
  });
};

/**
 * Query: Загрузка новостей по тикерам
 */
export const useNewsByTickersQuery = (tickerSymbols: string[]) => {
  return useQuery({
    queryKey: tickerQueryKeys.newsByTickers(tickerSymbols),
    queryFn: () =>
      tickerSymbols.length > 0
        ? tickersApi.getNewsByTickers(tickerSymbols)
        : Promise.resolve([]),
    enabled: true, // Always enabled, but returns empty array when no tickers
    staleTime: 1000 * 60, // 1 минута
  });
};

/**
 * Query: Загрузка фундаментальных данных
 */
export const useFundamentalDataQuery = () => {
  return useQuery({
    queryKey: tickerQueryKeys.fundamental(),
    queryFn: () => tickersApi.getFundamentalData(),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

/**
 * Query: Загрузка фундаментальных данных по тикерам
 */
export const useFundamentalDataByTickersQuery = (tickerSymbols: string[]) => {
  return useQuery({
    queryKey: tickerQueryKeys.fundamentalByTickers(tickerSymbols),
    queryFn: () =>
      tickerSymbols.length > 0
        ? tickersApi.getFundamentalDataByTickers(tickerSymbols)
        : Promise.resolve([]),
    enabled: true, // Always enabled, but returns empty array when no tickers
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

/**
 * Query: Загрузка технического анализа
 */
export const useTechnicalDataQuery = () => {
  return useQuery({
    queryKey: tickerQueryKeys.technical(),
    queryFn: () => tickersApi.getTechnicalData(),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

/**
 * Query: Загрузка технического анализа по тикерам
 */
export const useTechnicalDataByTickersQuery = (tickerSymbols: string[]) => {
  return useQuery({
    queryKey: tickerQueryKeys.technicalByTickers(tickerSymbols),
    queryFn: () =>
      tickerSymbols.length > 0
        ? tickersApi.getTechnicalDataByTickers(tickerSymbols)
        : Promise.resolve([]),
    enabled: true, // Always enabled, but returns empty array when no tickers
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

/**
 * Query: Загрузка конфигурации табов аналитики
 */
export const useAnalyticsTabsQuery = () => {
  return useQuery({
    queryKey: tickerQueryKeys.analyticsTabs(),
    queryFn: () => tickersApi.getAnalyticsTabs(),
    staleTime: 1000 * 60 * 10, // 10 минут - конфигурация табов редко меняется
  });
};

/**
 * Query: Пакетная загрузка котировок по символам тикеров (POST /ticker/batch)
 */
export const useTickerBatchQuery = (
  symbols: string[],
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: tickerQueryKeys.batch(symbols),
    queryFn: () => tickersApi.getTickerBatch(symbols),
    enabled: (options?.enabled ?? true) && symbols.length > 0,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Infinite Query: Загрузка тикеров с бесконечной прокруткой
 */
export const useInfiniteTickersQuery = (params?: {
  search?: string;
  market?: number;
  type?: number;
  limit?: number;
  sort?: string;
  ordering?: string;
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ['tickers', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      tickersApi.getTickers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has items, there might be more
      if (lastPage && lastPage.length > 0) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: params?.enabled ?? true, // Allow disabling the query
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

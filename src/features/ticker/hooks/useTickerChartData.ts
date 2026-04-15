import { tickersApi } from '@/services/api/tickers';
import { SparklineDataPoint } from '@/types/ticker';
import { useQuery } from '@tanstack/react-query';

export interface TickerChartData {
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
}

interface UseTickerChartDataParams {
  security_id?: number;
  period?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch fresh ticker chart data for display on board cards
 *
 * This hook fetches current market data from the backend API,
 * which is cached in Redis for 5 minutes to reduce API load.
 *
 * @param security_id - Security ID of the ticker
 * @param period - Chart period (D, W, M, Q, Y, all) - defaults to all (5 years)
 * @param enabled - Whether to enable the query (defaults to true if security_id is provided)
 */
export const useTickerChartData = ({
  security_id,
  period = 'all',
  enabled = true,
}: UseTickerChartDataParams) => {
  return useQuery<TickerChartData>({
    queryKey: ['ticker-chart-data', security_id, period],
    queryFn: async () => {
      if (!security_id) {
        throw new Error('security_id is required');
      }

      const response = await tickersApi.getChartCardData(security_id, period);
      return response;
    },
    enabled: enabled && !!security_id,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend cache
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

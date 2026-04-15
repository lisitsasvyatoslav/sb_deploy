import {
  StrategyProfitPointsResponse,
  TradingStrategyDto,
} from '@/types/StrategiesCatalog';
import { apiClientStrategiesCatalog } from './clientStrategiesCatalog';

export const strategyCatalogApi = {
  async getStrategy(id: number | string): Promise<TradingStrategyDto> {
    const response = await apiClientStrategiesCatalog.get<TradingStrategyDto>(
      `/${id}`
    );
    return response.data;
  },
  async getProfitPoints(
    id: number | string,
    params?: { From?: string; To?: string; lastPoints?: number }
  ): Promise<StrategyProfitPointsResponse> {
    const response =
      await apiClientStrategiesCatalog.get<StrategyProfitPointsResponse>(
        `/${id}/profit-points`,
        { params }
      );
    return response.data;
  },
};

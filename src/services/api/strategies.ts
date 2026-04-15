import { apiClient } from '@/services/api/client';
import type {
  Strategy,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  PublishToMarketplaceRequest,
} from '@/types';

export const strategyApi = {
  async getStrategies(boardId: number): Promise<Strategy[]> {
    const response = await apiClient.get<Strategy[]>('/strategy', {
      params: { boardId },
    });
    return response.data;
  },

  async getStrategy(id: number): Promise<Strategy> {
    const response = await apiClient.get<Strategy>(`/strategy/${id}`);
    return response.data;
  },

  async createStrategy(data: CreateStrategyRequest): Promise<Strategy> {
    const response = await apiClient.post<Strategy>('/strategy', data);
    return response.data;
  },

  async updateStrategy(
    id: number,
    data: UpdateStrategyRequest
  ): Promise<Strategy> {
    const response = await apiClient.put<Strategy>(`/strategy/${id}`, data);
    return response.data;
  },

  async deleteStrategy(id: number): Promise<void> {
    await apiClient.delete(`/strategy/${id}`);
  },

  async publishToMarketplace(
    id: number,
    data: PublishToMarketplaceRequest
  ): Promise<void> {
    // TODO: POST /api/strategy/{id}/publish — заменить на реальный вызов когда бэкенд будет готов
    console.log('[mock] publishToMarketplace', { id, data });
    return Promise.resolve();
  },
};

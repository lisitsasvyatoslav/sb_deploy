import type {
  CreatePortfolioRequest,
  PortfolioResponse,
  PortfolioWithSummaryResponse,
  UpdatePortfolioRequest,
} from '@/types/portfolio';
import { apiClient } from './client';

export const portfolioApi = {
  async getPortfolios(): Promise<PortfolioResponse[]> {
    const response = await apiClient.get('/portfolio');
    return response.data;
  },

  async getPortfolio(id: number): Promise<PortfolioResponse> {
    const response = await apiClient.get(`/portfolio/${id}`);
    return response.data;
  },

  async getPortfoliosWithSummary(): Promise<PortfolioWithSummaryResponse[]> {
    const response = await apiClient.get('/portfolio/with-summary');
    return response.data;
  },

  async createPortfolio(
    data: CreatePortfolioRequest
  ): Promise<PortfolioResponse> {
    const response = await apiClient.post('/portfolio', data);
    return response.data;
  },

  async updatePortfolio(
    id: number,
    data: UpdatePortfolioRequest
  ): Promise<PortfolioResponse> {
    const response = await apiClient.patch(`/portfolio/${id}`, data);
    return response.data;
  },

  async deletePortfolio(id: number): Promise<void> {
    await apiClient.delete(`/portfolio/${id}`);
  },

  async getBoardPortfolioSettings(
    boardId: number
  ): Promise<{ portfolioId: number | null; portfolioName: string | null }> {
    const response = await apiClient.get(
      `/portfolio/board-settings/${boardId}`
    );
    return {
      portfolioId: response.data.portfolioId ?? null,
      portfolioName: response.data.portfolioName ?? null,
    };
  },

  async setBoardPortfolioId(
    boardId: number,
    portfolioId: number | null
  ): Promise<void> {
    await apiClient.put(`/portfolio/board-settings/${boardId}`, {
      portfolioId,
    });
  },
};

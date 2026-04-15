import { apiClient } from '@/services/api/client';
import type {
  Edge,
  CreateEdgeRequest,
  UpdateEdgeRequest,
  EdgeListResponse,
} from '@/types';

export const edgeApi = {
  // Card edges API
  async createEdge(edgeData: CreateEdgeRequest): Promise<Edge> {
    const payload: Record<string, unknown> = {
      sourceId: edgeData.sourceCardId,
      targetId: edgeData.targetCardId,
      edgeType: edgeData.edgeType,
    };
    if (edgeData.meta) {
      payload.meta = edgeData.meta;
    }
    const response = await apiClient.post('/edge', payload);
    return response.data;
  },

  async getEdge(edgeId: number): Promise<Edge> {
    const response = await apiClient.get(`/edge/${edgeId}`);
    return response.data;
  },

  async getEdgesByCard(cardId: number): Promise<EdgeListResponse> {
    const response = await apiClient.get(`/edge/card/${cardId}`);
    return response.data;
  },

  async getAllEdges(): Promise<EdgeListResponse> {
    const response = await apiClient.get('/edge');
    return response.data;
  },

  async updateEdge(edgeId: number, edgeData: UpdateEdgeRequest): Promise<Edge> {
    const payload: Record<string, string | number | undefined> = {};
    if (edgeData.sourceCardId !== undefined)
      payload.sourceId = edgeData.sourceCardId;
    if (edgeData.targetCardId !== undefined)
      payload.targetId = edgeData.targetCardId;
    if (edgeData.edgeType !== undefined) payload.edgeType = edgeData.edgeType;
    const response = await apiClient.put(`/edge/${edgeId}`, payload);
    return response.data;
  },

  async deleteEdge(edgeId: number): Promise<void> {
    await apiClient.delete(`/edge/${edgeId}`);
  },

  async deleteEdgesByCard(
    cardId: number
  ): Promise<{ message: string; deletedCount: number }> {
    const response = await apiClient.delete(`/edge/card/${cardId}`);
    return response.data;
  },
};

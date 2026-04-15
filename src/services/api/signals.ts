/**
 * API client for Signal endpoints
 */

import { apiClient } from '@/services/api/client';
import type {
  CreateSignalWebhookRequest,
  GeneratedUrl,
  SignalWebhook,
  SignalListResponse,
  SignalWebhookListResponse,
  UpdateSignalWebhookRequest,
} from '@/types';

export const signalApi = {
  /**
   * Generate webhook URL without saving to database
   */
  async generateWebhookUrl(): Promise<GeneratedUrl> {
    const response = await apiClient.get<GeneratedUrl>('/signal/generate-url');
    return response.data;
  },

  /**
   * Get all signal webhooks for current user, optionally filtered by boardId
   */
  async getSignalWebhooks(
    boardId?: number
  ): Promise<SignalWebhookListResponse> {
    const response = await apiClient.get<SignalWebhookListResponse>('/signal', {
      params: boardId !== undefined ? { boardId: boardId } : undefined,
    });
    return response.data;
  },

  /**
   * Get single signal webhook by ID
   */
  async getSignalWebhook(id: number): Promise<SignalWebhook> {
    const response = await apiClient.get<SignalWebhook>(`/signal/${id}`);
    return response.data;
  },

  /**
   * Create new signal webhook with auto-generated card
   */
  async createSignalWebhook(
    data: CreateSignalWebhookRequest
  ): Promise<SignalWebhook> {
    // Data is already in camelCase format from frontend types
    const response = await apiClient.post<SignalWebhook>('/signal', data);
    return response.data;
  },

  /**
   * Update signal webhook
   */
  async updateSignalWebhook(
    id: number,
    data: UpdateSignalWebhookRequest
  ): Promise<SignalWebhook> {
    // Data is already in camelCase format from frontend types
    const response = await apiClient.put<SignalWebhook>(`/signal/${id}`, data);
    return response.data;
  },

  /**
   * Delete signal webhook (soft delete - sets active=False)
   */
  async deleteSignalWebhook(id: number): Promise<void> {
    await apiClient.delete(`/signal/${id}`);
  },

  /**
   * Get signal history for webhook
   */
  async getSignalHistory(
    webhookId: number,
    limit = 100
  ): Promise<SignalListResponse> {
    const response = await apiClient.get<SignalListResponse>(
      `/signal/${webhookId}/data`,
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

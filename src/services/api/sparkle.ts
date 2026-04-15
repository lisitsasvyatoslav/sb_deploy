import axios from 'axios';
import { apiClient } from '@/services/api/client';

export interface SparkleMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SparkleDialog {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  mockDialog: SparkleMessage[];
}

export interface SparkleDialogFull extends SparkleDialog {
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SparkleDialogCreate {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  mockDialog: SparkleMessage[];
  isActive?: boolean;
  order?: number;
}

export interface SparkleDialogUpdate {
  slug?: string;
  name?: string;
  description?: string;
  icon?: string;
  mockDialog?: SparkleMessage[];
  isActive?: boolean;
  order?: number;
}
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

// Public API client (no auth required)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const sparkleApi = {
  // Public endpoints
  async getAll(): Promise<SparkleDialog[]> {
    const resp = await publicApiClient.get('/sparkle');
    return resp.data;
  },

  async getBySlug(slug: string): Promise<SparkleDialog> {
    const resp = await publicApiClient.get(`/sparkle/${slug}`);
    return resp.data;
  },

  // Protected endpoints (require auth)
  async getAllAdmin(): Promise<{
    sparkles: SparkleDialogFull[];
    total: number;
  }> {
    const resp = await apiClient.get('/sparkle/admin/all');
    return resp.data;
  },

  async create(data: SparkleDialogCreate): Promise<SparkleDialogFull> {
    const resp = await apiClient.post('/sparkle', data);
    return resp.data;
  },

  async update(
    id: number,
    data: SparkleDialogUpdate
  ): Promise<SparkleDialogFull> {
    const resp = await apiClient.put(`/sparkle/${id}`, data);
    return resp.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/sparkle/${id}`);
  },
};

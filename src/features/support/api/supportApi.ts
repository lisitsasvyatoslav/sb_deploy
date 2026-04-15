import { apiClient } from '@/services/api/client';

export interface CreateSupportRequestPayload {
  reason: string;
  message: string;
}

export interface CreateSupportRequestResponse {
  id: string;
  createdAt: string;
}

export const supportApi = {
  createRequest: async (
    data: CreateSupportRequestPayload,
  ): Promise<CreateSupportRequestResponse> => {
    const response = await apiClient.post<CreateSupportRequestResponse>(
      '/support/request',
      data,
    );
    return response.data;
  },
};

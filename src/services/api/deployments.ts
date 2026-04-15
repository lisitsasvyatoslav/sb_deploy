import { apiClient, API_BASE_URL_EXPORT } from '@/services/api/client';
import { fetchWithTokenRefresh } from '@/services/api/tokenRefresh';
import type {
  Deployment,
  TradingIdea,
  DeployStrategyRequest,
  DeploySSEEvent,
} from '@/types/deployment';

export const deploymentApi = {
  async getDeployments(strategyId: number): Promise<Deployment[]> {
    const response = await apiClient.get<Deployment[]>(
      `/strategy/${strategyId}/deployments`
    );
    return response.data;
  },

  async getDeployment(
    strategyId: number,
    deploymentId: number
  ): Promise<Deployment> {
    const response = await apiClient.get<Deployment>(
      `/strategy/${strategyId}/deployments/${deploymentId}`
    );
    return response.data;
  },

  async getIdeas(
    strategyId: number,
    deploymentId: number
  ): Promise<TradingIdea[]> {
    const response = await apiClient.get<TradingIdea[]>(
      `/strategy/${strategyId}/deployments/${deploymentId}/ideas`
    );
    return response.data;
  },

  async downloadCSV(strategyId: number, deploymentId: number): Promise<Blob> {
    const response = await apiClient.get(
      `/strategy/${strategyId}/deployments/${deploymentId}/csv`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  async deploy(
    strategyId: number,
    onEvent: (event: DeploySSEEvent) => void,
    dto?: DeployStrategyRequest,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const response = await fetchWithTokenRefresh((token) =>
      fetch(`${API_BASE_URL_EXPORT}/strategy/${strategyId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(dto || {}),
        signal: abortSignal,
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deploy failed: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = 'message';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEventType = line.slice(6).trim();
          continue;
        }

        if (line.trim() === '' || line.startsWith(':')) {
          continue;
        }

        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          const eventType = currentEventType;
          currentEventType = 'message';
          try {
            const raw = JSON.parse(data);
            const parsed = { ...raw, type: eventType } as DeploySSEEvent;
            onEvent(parsed);
          } catch {
            // Skip unparseable data
          }
        }
      }
    }
  },
};

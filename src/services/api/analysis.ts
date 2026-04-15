import { apiClient } from '@/services/api/client';
import type {
  MarketAnalysisRequest,
  MarketAnalysisResponse,
  LLMAnalysisRequest,
  LLMAnalysisResponse,
  LLMProviderListResponse,
} from '@/types';
import type { VersionInfo } from '@/shared/utils/version';

export const analysisApi = {
  async analyzeMarket(
    request: MarketAnalysisRequest
  ): Promise<MarketAnalysisResponse> {
    const response = await apiClient.post('/analyze-market', request);
    return response.data;
  },

  async searchKnowledgeBase(
    query: string,
    limit = 10
  ): Promise<{ results: unknown[] }> {
    const response = await apiClient.get('/search', {
      params: { query, limit },
    });
    return response.data;
  },

  async analyzePrompt(
    request: LLMAnalysisRequest
  ): Promise<LLMAnalysisResponse> {
    const response = await apiClient.post('/analysis/prompt', request);
    return response.data;
  },

  async getLLMProviders(): Promise<LLMProviderListResponse> {
    const response = await apiClient.get('/llm/providers');
    return response.data;
  },

  async transcribeVoice(
    audioBlob: Blob
  ): Promise<{ transcribed_text: string; confidence: number }> {
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    const response = await apiClient.post('/transcribe-voice', {
      audio_data: base64Audio,
      language: 'en-US',
    });
    return response.data;
  },

  async getVersion(): Promise<VersionInfo> {
    const response = await apiClient.get('/version');
    return response.data;
  },

  async runMigration(): Promise<{ message: string }> {
    const response = await apiClient.post('/migrate');
    return response.data;
  },
};

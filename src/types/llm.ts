import { LLMProvider, PromptType, PromptStatus } from './common';

// ========== LLM MODELS ==========
export interface LLMModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens?: number;
}

export interface LLMProviderInfo {
  id: LLMProvider;
  name: string;
  description: string;
  models: LLMModel[];
  isAvailable: boolean;
}

export interface LLMProviderListResponse {
  providers: LLMProviderInfo[];
  totalCount: number;
}

// ========== LLM ANALYSIS ==========
export interface LLMAnalysisRequest {
  prompt: string;
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  additionalContext?: string;
}

export interface LLMAnalysisResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  success: boolean;
  createdAt: string;
}

// ========== PROMPTS ==========
export interface Prompts {
  id: number;
  boardId?: number;
  cardDataId?: number;
  title: string;
  content: string;
  type: PromptType;
  llmProvider: LLMProvider;
  status: PromptStatus;
  result?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePromptRequest {
  boardId?: number;
  cardDataId?: number;
  title: string;
  content: string;
  type: PromptType;
  llmProvider: LLMProvider;
  status?: PromptStatus;
}

export interface UpdatePromptRequest {
  boardId?: number;
  cardDataId?: number;
  title?: string;
  content?: string;
  type?: PromptType;
  llmProvider?: LLMProvider;
  status?: PromptStatus;
  result?: string;
}

// ========== MARKET ANALYSIS (LEGACY) ==========
export interface MarketAnalysisRequest {
  symbols: string[];
  timeframe?: string;
  additionalContext?: string;
}

export interface MarketAnalysisResponse {
  id: number;
  symbols: string[];
  timeframe: string;
  analysis: {
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
    keyFactors: string[];
    recommendations: {
      symbol: string;
      action: 'buy' | 'sell' | 'hold';
      confidence: number;
      reasoning: string;
    }[];
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high';
      specificRisks: string[];
      riskMitigation: string;
    };
  };
  createdAt: string;
}

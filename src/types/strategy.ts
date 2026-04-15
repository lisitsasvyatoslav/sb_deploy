export type StrategyStatus = 'draft' | 'active' | 'published';

export interface Strategy {
  id: number;
  userId: string;
  boardId: number | null;
  name: string;
  description?: string;
  promptText?: string;
  status: StrategyStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStrategyRequest {
  boardId: number;
  name: string;
  description?: string;
  promptText?: string;
}

export interface UpdateStrategyRequest {
  name?: string;
  description?: string;
  promptText?: string;
  status?: StrategyStatus;
  isPublic?: boolean;
}

export type MarketplaceStrategyType =
  | 'Trend'
  | 'MeanReversion'
  | 'Arbitrage'
  | 'News';

export type MarketplaceRiskLevel = 'Conservative' | 'Moderate' | 'Aggressive';

export interface PublishToMarketplaceRequest {
  title: string;
  description: string;
  strategyType: MarketplaceStrategyType;
  riskLevel: MarketplaceRiskLevel;
}

export interface Deployment {
  id: number;
  strategyId: number;
  sequenceNumber: number;
  promptSnapshot: string;
  ideasTtlSeconds: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface TradingIdea {
  id: number;
  ticker: string;
  securityId?: number;
  direction: 'long' | 'short';
  entryPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  lots: number;
  currency?: string;
  rationale?: string;
  confidence?: number;
  riskPercent?: number;
  riskRewardRatio?: number;
  suggestedQuantity?: number;
  validFrom?: string;
  validUntil?: string;
  exitByDate?: string;
}

export interface RiskSettings {
  deposit?: number;
  maxRiskPercent?: number;
  minRiskRewardRatio?: number;
}

export interface DeployStrategyRequest {
  ideasTtlSeconds?: number;
  riskSettings?: RiskSettings;
}

// SSE event payloads
export interface DeploymentStartedEvent {
  deploymentId: number;
  sequenceNumber: number;
}

export interface DeploymentCompletedEvent {
  deployment: Deployment;
  ideas: TradingIdea[];
}

export interface DeploymentFailedEvent {
  error: string;
}

export type DeploySSEEvent =
  | { type: 'deployment_started'; deploymentId: number; sequenceNumber: number }
  | { type: 'llm_processing'; progress: string }
  | { type: 'ideas_saved'; count: number }
  | {
      type: 'deployment_completed';
      deployment: Deployment;
      ideas: TradingIdea[];
    }
  | { type: 'deployment_failed'; error: string };

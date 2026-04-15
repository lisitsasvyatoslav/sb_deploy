import type { TradingStrategyDto } from '@/types/StrategiesCatalog';

export interface StrategyBinding {
  id: number;
  externalStrategyId: string;
  comonUserId: string;
  source: string;
  boundAt: string;
}

export interface StrategyBindingInitResponse {
  comonRedirectUrl: string;
  expiresAt: string;
}

// TODO [MOCK]: After backend implementation (TD-985) this type may be extended
// with fields from the real UserStrategyBinding entity
export interface StrategyBindingWithDetails extends StrategyBinding {
  strategy?: TradingStrategyDto;
}

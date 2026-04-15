export interface PortfolioFillRule {
  type: 'all' | 'broker' | 'account' | 'manual' | 'instrument';
  filter?: {
    brokerType?: string;
    accountIds?: number[];
    symbols?: string[];
    brokerTypes?: string[];
    selectedAccountIds?: string[];
    dateRange?: string;
  };
}

/** API body shape for instrument-scoped portfolios (matches FillRuleDto) */
export interface PortfolioInstrumentFillRule {
  type: 'instrument';
  instrumentFilter: {
    symbols: string[];
    brokerTypes?: string[];
    selectedAccountIds?: string[];
    dateRange?: string;
  };
}

export interface PortfolioAllFillRule {
  type: 'all';
}

export type PortfolioFillRuleRequest =
  | PortfolioInstrumentFillRule
  | PortfolioAllFillRule;

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  fillRule?: PortfolioFillRuleRequest;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
  fillRule?: PortfolioFillRuleRequest;
}

export interface PortfolioResponse {
  id: number;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  fillRule: PortfolioFillRule;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioWithSummaryResponse extends PortfolioResponse {
  totalValue: number | null;
  unrealizedPnl: number | null;
  realizedPnl: number | null;
  positionCount: number;
  hasSnapshot: boolean;
  currency: string | null;
}

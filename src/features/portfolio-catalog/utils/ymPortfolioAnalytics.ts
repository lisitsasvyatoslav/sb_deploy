import {
  mapBrokerCodeToYmBrokerName,
  type YmAnalyticsBrokerName,
} from '@/features/broker/utils/ymBrokerName';
import type { PortfolioFillRule } from '@/types/portfolio';

/**
 * broker_name for YM portfolio events: only broker-scoped fill rules map to Finam/ByBit/KuCoin.
 */
export function ymBrokerNameFromPortfolioFillRule(
  fillRule: PortfolioFillRule | undefined | null
): YmAnalyticsBrokerName {
  if (!fillRule || fillRule.type !== 'broker') {
    return 'none';
  }
  return mapBrokerCodeToYmBrokerName(fillRule.filter?.brokerType);
}

export function ymPortfolioContextFromCatalog(
  portfolioId: number | null | undefined,
  fillRule: PortfolioFillRule | undefined | null
): { portfolio_id: number; broker_name: YmAnalyticsBrokerName } {
  return {
    portfolio_id: portfolioId ?? 0,
    broker_name: ymBrokerNameFromPortfolioFillRule(fillRule),
  };
}

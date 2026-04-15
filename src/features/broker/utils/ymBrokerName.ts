/**
 * Yandex Metrika broker_name param (product dashboards): only Finam / ByBit / KuCoin;
 * all other broker codes (e.g. t-invest, snaptrade) map to "none".
 */
export type YmAnalyticsBrokerName = 'Finam' | 'ByBit' | 'KuCoin' | 'none';

export function mapBrokerCodeToYmBrokerName(
  brokerCode: string | null | undefined
): YmAnalyticsBrokerName {
  switch (brokerCode) {
    case 'finam':
      return 'Finam';
    case 'bybit':
      return 'ByBit';
    case 'kucoin':
      return 'KuCoin';
    default:
      return 'none';
  }
}

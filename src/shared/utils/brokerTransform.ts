import type { Broker, TradingAccount } from '@/types/broker';
import type { TranslateFn } from '@/shared/i18n';

const BROKER_URLS: Record<string, string> = {
  finam: 'broker.finam.ru',
  snaptrade: 'snaptrade.com',
  't-invest': 'tbank.ru',
  bybit: 'www.bybit.com',
  kucoin: 'www.kucoin.com',
  demo: 'demo.trading-diary.com',
};

function getBrokerMetadata(
  t?: TranslateFn
): Record<string, { name: string; url: string }> {
  if (t) {
    return {
      finam: { name: t('metadata.finam'), url: BROKER_URLS.finam },
      snaptrade: { name: t('metadata.snaptrade'), url: BROKER_URLS.snaptrade },
      't-invest': {
        name: t('metadata.t-invest'),
        url: BROKER_URLS['t-invest'],
      },
      bybit: { name: t('metadata.bybit'), url: BROKER_URLS.bybit },
      kucoin: { name: t('metadata.kucoin'), url: BROKER_URLS.kucoin },
      demo: { name: t('metadata.demo'), url: BROKER_URLS.demo },
    };
  }
  // Fallback when t is not available (non-React context)
  return {
    finam: { name: 'Finam', url: BROKER_URLS.finam },
    snaptrade: { name: 'SnapTrade', url: BROKER_URLS.snaptrade },
    't-invest': { name: 'T-Investments', url: BROKER_URLS['t-invest'] },
    bybit: { name: 'Bybit', url: BROKER_URLS.bybit },
    kucoin: { name: 'KuCoin', url: BROKER_URLS.kucoin },
    demo: { name: 'Demo', url: BROKER_URLS.demo },
  };
}

/**
 * Build a human-readable account display name.
 *
 * Rules:
 * - If institutionName exists: `{institutionName} — {accountName || accountId}`
 * - Else if accountName exists and differs from accountId: `{accountId} ({accountName})`
 *   (e.g. KuCoin: "kucoin-015986be (KuCoin)")
 * - Else: `{accountName || accountId}`
 *   (e.g. Finam: "2024520" where accountName === accountId — avoids "2024520 (2024520)")
 */
function formatAccountName(acc: TradingAccount): string {
  if (acc.institutionName) {
    return `${acc.institutionName} — ${acc.accountName || acc.accountId}`;
  }
  if (acc.accountName && acc.accountName !== acc.accountId) {
    return `${acc.accountId} (${acc.accountName})`;
  }
  return acc.accountName || acc.accountId;
}

/**
 * Transforms a list of TradingAccount into a broker-grouped structure for the UI filter.
 * Deduplicates by (brokerType, accountId).
 */
export function transformAccountsToBrokers(
  accounts: TradingAccount[],
  t?: TranslateFn
): Broker[] {
  const uniqueAccountsMap = new Map<string, TradingAccount>();

  accounts.forEach((account) => {
    const key = `${account.brokerType}:${account.accountId}`;

    if (!uniqueAccountsMap.has(key)) {
      uniqueAccountsMap.set(key, account);
    }
  });

  const uniqueAccounts = Array.from(uniqueAccountsMap.values());

  const grouped = uniqueAccounts.reduce(
    (acc, account) => {
      if (!acc[account.brokerType]) {
        acc[account.brokerType] = [];
      }
      acc[account.brokerType].push(account);
      return acc;
    },
    {} as Record<string, TradingAccount[]>
  );

  const metadata = getBrokerMetadata(t);

  return Object.entries(grouped).map(([brokerType, brokerAccounts]) => ({
    type: brokerType,
    name: metadata[brokerType]?.name || brokerType,
    url: metadata[brokerType]?.url || '',
    icon: brokerType,
    accounts: brokerAccounts.map((acc) => ({
      id: `${acc.brokerType}:${acc.accountId}`,
      name: formatAccountName(acc),
      brokerType: acc.brokerType,
    })),
  }));
}

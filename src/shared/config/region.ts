export type DeploymentRegion = 'ru' | 'us';

const VALID_REGIONS: ReadonlySet<string> = new Set<DeploymentRegion>([
  'ru',
  'us',
]);

const rawRegion = process.env.NEXT_PUBLIC_DEPLOYMENT_REGION;

export const REGION: DeploymentRegion =
  rawRegion && VALID_REGIONS.has(rawRegion)
    ? (rawRegion as DeploymentRegion)
    : 'ru';

const defaultBrokers: Record<DeploymentRegion, readonly string[]> = {
  ru: ['finam', 'bybit', 't-invest', 'kucoin', 'bks', 'alfa'],
  us: ['snaptrade', 'bybit', 'kucoin'],
};

const parsedBrokers: readonly string[] = process.env.NEXT_PUBLIC_BROKERS
  ? process.env.NEXT_PUBLIC_BROKERS.split(',').map((b) => b.trim())
  : defaultBrokers[REGION];

/**
 * Returns the dev-overridden region on the client (cookie).
 * Falls back to the env-var-based REGION.
 * Safe to call on server (always returns REGION).
 */
export function getClientRegion(): DeploymentRegion {
  if (
    typeof document !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    const match = document.cookie.match(
      /(?:^|;\s*)dev-region-override=([^;]*)/
    );
    const override = match ? decodeURIComponent(match[1]) : null;
    if (override && VALID_REGIONS.has(override)) {
      return override as DeploymentRegion;
    }
  }
  return REGION;
}

export function getClientRegionConfig() {
  return regionConfig[getClientRegion()];
}

export const regionConfig = {
  ru: {
    defaultLocale: 'ru' as const,
    availableLocales: ['ru', 'en'] as const,
    theme: 'finam' as const,
    brandPrimaryHex: '#7863F6' as const,
    brokers: parsedBrokers,
    analytics: 'yandex' as const,
    complianceRules: 'cbr' as const,
    baseCurrency: 'RUB' as const,
  },
  us: {
    defaultLocale: 'en' as const,
    availableLocales: ['en'] as const,
    theme: 'lime' as const,
    brandPrimaryHex: '#A9DC4D' as const,
    brokers: parsedBrokers,
    analytics: 'google' as const,
    complianceRules: 'sec' as const,
    baseCurrency: 'USD' as const,
  },
};

export type RegionConfig = (typeof regionConfig)[DeploymentRegion];

export const currentRegionConfig = regionConfig[REGION];

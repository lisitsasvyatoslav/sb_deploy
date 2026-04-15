import type { TranslateFn } from '@/shared/i18n/settings';
import type { RiskLevel } from '@/types/StrategiesCatalog';

/** Risk tier label for catalog-style cards; uses `strategiesCatalog.card` i18n keys. */
export function getStrategyCardRiskLabel(
  risk: RiskLevel,
  t: TranslateFn
): string | null {
  switch (risk) {
    case 'conservative':
      return t('strategiesCatalog.card.riskConservative');
    case 'moderate':
      return t('strategiesCatalog.card.riskModerate');
    case 'aggressive':
      return t('strategiesCatalog.card.riskAggressive');
    default:
      return null;
  }
}

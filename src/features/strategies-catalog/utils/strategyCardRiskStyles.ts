import type { RiskLevel } from '@/types/StrategiesCatalog';

const RISK_TEXT_CLASSES: Record<NonNullable<RiskLevel>, string> = {
  conservative: 'text-emerald-500',
  moderate: 'text-yellow-500',
  aggressive: 'text-red-500',
};

const SURVEY_RISK_TEXT_CLASSES: Record<NonNullable<RiskLevel>, string> = {
  conservative: 'text-status-success',
  moderate: 'text-status-warning',
  aggressive: 'text-status-negative',
};

/** Text color classes for compact catalog-style strategy cards (Zap + risk label row). */
export function getStrategyCardRiskTextClass(risk: RiskLevel): string | null {
  if (!risk) return null;
  return RISK_TEXT_CLASSES[risk] ?? null;
}

/** Semantic status text colors for survey / chat strategy recommendation cards. */
export function getSurveyStrategyCardRiskTextClass(
  risk: RiskLevel
): string | null {
  if (!risk) return null;
  return SURVEY_RISK_TEXT_CLASSES[risk] ?? null;
}

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { RiskLevel } from '@/types/StrategiesCatalog';
import { Zap } from 'lucide-react';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { currentRegionConfig } from '@/shared/config/region';

interface StrategyDetailKeyMetricsProps {
  profitability?: number;
  riskLevel?: RiskLevel;
  minSum?: number | string;
  maxDrawDown?: number | string;
}

const LABEL = 'text-14 leading-20 tracking-tight-1 text-blackinverse-a32';
const VALUE = 'text-14 leading-20 tracking-tight-1 text-text-primary';

const getRiskLevelColorClass = (risk: RiskLevel): string => {
  switch (risk) {
    case 'aggressive':
      return 'text-status-negative'; // #F25555
    case 'conservative':
      return 'text-status-success'; // #4ED47C
    case 'moderate':
      return 'text-status-warning'; // #FF944E
    default:
      return 'text-text-primary';
  }
};

const StrategyDetailKeyMetrics: React.FC<StrategyDetailKeyMetricsProps> = ({
  profitability,
  riskLevel,
  minSum,
  maxDrawDown,
}) => {
  const { t, i18n } = useTranslation('common');
  const numberLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  const formatRiskLevel = (risk: RiskLevel): string => {
    switch (risk) {
      case 'aggressive':
        return t('strategiesCatalog.detail.riskAggressive');
      case 'moderate':
        return t('strategiesCatalog.detail.riskModerate');
      case 'conservative':
        return t('strategiesCatalog.detail.riskConservative');
      default:
        return '—';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <span className={LABEL}>
          {t('strategiesCatalog.detail.profitability')}
        </span>
        <span className="text-24 font-medium leading-[19px] uppercase text-text-primary">
          {profitability != null
            ? `${profitability.toFixed(1).replace('.', ',')}%`
            : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={LABEL}>{t('strategiesCatalog.detail.risk')}</span>
        <span
          className={`text-14 leading-20 tracking-tight-1 flex items-center gap-1 ${riskLevel ? getRiskLevelColorClass(riskLevel) : 'text-text-primary'}`}
        >
          <Zap className="w-3 h-3" />
          {riskLevel ? formatRiskLevel(riskLevel) : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={LABEL}>{t('strategiesCatalog.detail.minAmount')}</span>
        <span className={VALUE}>
          {minSum != null
            ? `${Number(minSum).toLocaleString(numberLocale)} ${getCurrencySymbol(currentRegionConfig.baseCurrency)}`
            : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={LABEL}>
          {t('strategiesCatalog.detail.maxDrawdown')}
        </span>
        <span className={VALUE}>
          {maxDrawDown != null ? `${Math.round(Number(maxDrawDown))}%` : '—'}
        </span>
      </div>
    </div>
  );
};

export default StrategyDetailKeyMetrics;

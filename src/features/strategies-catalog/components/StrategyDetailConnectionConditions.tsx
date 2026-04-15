import React from 'react';
import { ClientRiskCategory } from '@/types/StrategiesCatalog';
import { useTranslation } from '@/shared/i18n/client';

interface StrategyDetailConnectionConditionsProps {
  isQualRequired?: boolean;
  clientRiskCategory?: ClientRiskCategory;
}

// TODO [MOCK] — необходимые тесты, инвестиционный профиль нет в API
const MOCK_REQUIRED_TESTS = [
  'Акции вне котировальных списков',
  'Облигации со структурным доходом',
  'Производные финансовые инструменты(ПФИ)',
];
const MOCK_INVESTMENT_PROFILE = 'Умеренный, агрессивный';

const LABEL =
  'text-16 leading-20 tracking-tight-1 font-semibold text-blackinverse-a56';
const TEXT = 'text-14 leading-20 tracking-tight-1 text-blackinverse-a56';

const StrategyDetailConnectionConditions: React.FC<
  StrategyDetailConnectionConditionsProps
> = ({ isQualRequired, clientRiskCategory }) => {
  const { t } = useTranslation('common');

  const formatRiskCategory = (category?: ClientRiskCategory): string => {
    if (category == null) return '—';
    const labels: Record<number, string> = {
      [ClientRiskCategory.Ksur]: t('strategiesCatalog.detail.riskKsur'),
      [ClientRiskCategory.Knur]: t('strategiesCatalog.detail.riskKnur'),
      [ClientRiskCategory.Kpur]: t('strategiesCatalog.detail.riskKpur'),
    };
    return labels[category] ?? '—';
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-16 leading-20 font-semibold text-text-primary">
        {t('strategiesCatalog.detail.connectionTitle')}
      </span>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>
              {t('strategiesCatalog.detail.qualification')}
            </span>
            <span className={TEXT}>
              {isQualRequired
                ? t('strategiesCatalog.detail.qualRequired')
                : t('strategiesCatalog.detail.qualNotRequired')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>
              {t('strategiesCatalog.detail.investmentProfile')}
            </span>
            {/* TODO [MOCK] — инвестиционный профиль нет в API */}
            <span className={TEXT}>{MOCK_INVESTMENT_PROFILE}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>
              {t('strategiesCatalog.detail.riskCategory')}
            </span>
            <span className={TEXT}>
              {formatRiskCategory(clientRiskCategory)}
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-1">
          <span className={LABEL}>
            {t('strategiesCatalog.detail.requiredTests')}
          </span>
          {/* TODO [MOCK] — необходимые тесты нет в API */}
          {MOCK_REQUIRED_TESTS.map((test) => (
            <span key={test} className={TEXT}>
              {test}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailConnectionConditions;

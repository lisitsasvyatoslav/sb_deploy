import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { currentRegionConfig } from '@/shared/config/region';

interface StrategyDetailInfoProps {
  moneyLimit?: number | string;
  tradeActivityIndex?: number | string;
}

// TODO [MOCK] — followAccuracy и tradeFrequency нет в API, захардкожены
const MOCK_FOLLOW_ACCURACY = '4/5';
const MOCK_TRADE_FREQUENCY = 'Ежедневно';

const LABEL = 'text-14 leading-20 tracking-tight-1 text-blackinverse-a32';
const VALUE = 'text-14 leading-20 tracking-tight-1 text-text-primary';

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0 text-blackinverse-a32"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
    <text
      x="8"
      y="11.5"
      textAnchor="middle"
      fontSize="10"
      fill="currentColor"
      fontWeight="500"
    >
      ?
    </text>
  </svg>
);

interface InfoRowProps {
  label: string;
  value: string;
  hasInfo?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, hasInfo }) => (
  <div className="flex items-center justify-between">
    <span className={`${LABEL} flex items-center gap-1`}>
      {label}
      {hasInfo && <InfoIcon />}
    </span>
    <span className={VALUE}>{value}</span>
  </div>
);

const StrategyDetailInfo: React.FC<StrategyDetailInfoProps> = ({
  moneyLimit,
  tradeActivityIndex,
}) => {
  const { t, i18n } = useTranslation('common');
  const numberLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="flex flex-col gap-3">
      <InfoRow
        label={t('strategiesCatalog.detail.followAccuracy')}
        value={MOCK_FOLLOW_ACCURACY}
        hasInfo
      />
      <InfoRow
        label={t('strategiesCatalog.detail.tradeFrequency')}
        value={MOCK_TRADE_FREQUENCY}
      />
      <InfoRow
        label={t('strategiesCatalog.detail.tai')}
        value={tradeActivityIndex != null ? String(tradeActivityIndex) : '—'}
        hasInfo
      />
      <InfoRow
        label={t('strategiesCatalog.detail.capacity')}
        value={
          moneyLimit != null
            ? `${Number(moneyLimit).toLocaleString(numberLocale)} ${getCurrencySymbol(currentRegionConfig.baseCurrency)}`
            : '—'
        }
        hasInfo
      />
    </div>
  );
};

export default StrategyDetailInfo;

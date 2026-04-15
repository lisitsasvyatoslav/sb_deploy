import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface CardStatProps {
  label: string;
  value: string;
  vs: string;
  color?: 'green' | 'orange' | 'white';
  subLabel?: React.ReactNode; // если нужно что-то под лейблом
}

const colorMap: Record<string, string> = {
  green: 'text-status-success',
  orange: 'text-status-warning',
  white: 'text-text-primary',
};

const StrategyDetailCardStat: React.FC<CardStatProps> = ({
  label,
  value,
  vs,
  color = 'white',
  subLabel,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-background-card border border-border-light rounded-lg px-5 py-4 flex flex-col gap-2 min-w-[200px]">
      <div className="flex items-center gap-2 text-[15px] text-text-secondary">
        {label}
        {subLabel ? <span>{subLabel}</span> : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${colorMap[color]}`}>
          {value}
        </span>
        <span className="text-text-muted text-base font-light">
          {t('strategiesCatalog.detail.vs', { value: vs })}
        </span>
      </div>
    </div>
  );
};

export default StrategyDetailCardStat;

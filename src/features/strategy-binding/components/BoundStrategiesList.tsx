'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import { Link } from '@/shared/ui/Navigation';
import { useStrategyBindingsWithDetailsQuery } from '@/features/strategy-binding/queries';
import type { StrategyBindingWithDetails } from '@/types/strategyBinding';
import { StrategySummaryCard } from '@/features/strategies-catalog/components/StrategySummaryCard';

const BoundCard: React.FC<{ binding: StrategyBindingWithDetails }> = ({
  binding,
}) => {
  const { t, i18n } = useTranslation('common');
  const strategy = binding.strategy;
  if (!strategy) return null;

  const boundDate = new Date(binding.boundAt).toLocaleDateString(
    getDateLocaleTag(i18n.language)
  );

  return (
    <StrategySummaryCard
      strategy={strategy}
      density="compact"
      footerTrailing={
        <span className="text-[10px] text-text-muted">
          {t('strategyBinding.boundAt', { date: boundDate })}
        </span>
      }
    />
  );
};

const BoundStrategiesList: React.FC = () => {
  const { t } = useTranslation('common');
  const { data: bindings, isLoading } = useStrategyBindingsWithDetailsQuery();

  if (isLoading) return null;
  if (!bindings || bindings.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium theme-text-secondary uppercase tracking-wide">
          {t('strategyBinding.boundStrategies')}
        </div>
        <Link
          to="/strategies/bound"
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          {t('strategyBinding.viewAll')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {bindings.map((binding) => (
          <BoundCard key={binding.id} binding={binding} />
        ))}
      </div>
    </div>
  );
};

export default BoundStrategiesList;

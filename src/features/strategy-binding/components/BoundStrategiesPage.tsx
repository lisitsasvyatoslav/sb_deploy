'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import { useStrategyBindingsWithDetailsQuery } from '@/features/strategy-binding/queries';
import SurveyStrategyCard from '@/features/chat/components/chatWindow/strategySurvey/ui/SurveyStrategyCard';
import type { StrategyBindingWithDetails } from '@/types/strategyBinding';

const BoundStrategiesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: bindings, isLoading } = useStrategyBindingsWithDetailsQuery();

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-md hover:bg-background-muted transition text-text-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold theme-text-primary">
          {t('strategyBinding.boundStrategies')}
        </h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-[var(--border-light)] border-t-[var(--color-accent)] rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-sm theme-text-secondary">{t('loading')}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!bindings || bindings.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm theme-text-secondary mb-4">
            {t('strategyBinding.noBindings')}
          </p>
          <Button variant="accent" onClick={() => router.push('/profile')}>
            {t('strategyBinding.backToProfile')}
          </Button>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && bindings && bindings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bindings.map((binding) => (
            <BoundStrategyItem key={binding.id} binding={binding} />
          ))}
        </div>
      )}
    </div>
  );
};

const BoundStrategyItem: React.FC<{
  binding: StrategyBindingWithDetails;
}> = ({ binding }) => {
  const { t, i18n } = useTranslation('common');
  const strategy = binding.strategy;
  if (!strategy) return null;

  const boundDate = new Date(binding.boundAt).toLocaleDateString(
    getDateLocaleTag(i18n.language)
  );

  return (
    <div className="flex flex-col">
      <SurveyStrategyCard
        strategy={{ ...strategy, matchLabel: '' }}
        className="rounded-lg border border-border-light"
      />
      <span className="text-[11px] text-text-muted mt-1 px-1">
        {t('strategyBinding.boundAt', { date: boundDate })}
      </span>
    </div>
  );
};

export default BoundStrategiesPage;

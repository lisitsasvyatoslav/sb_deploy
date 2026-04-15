'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import {
  useInvalidateStrategyBindings,
  useStrategyBindingsWithDetailsQuery,
} from '@/features/strategy-binding/queries';
import type { StrategyBindingWithDetails } from '@/types/strategyBinding';
import { StrategySummaryCard } from '@/features/strategies-catalog/components/StrategySummaryCard';

const BoundStrategyCard: React.FC<{ binding: StrategyBindingWithDetails }> = ({
  binding,
}) => {
  const strategy = binding.strategy;
  if (!strategy) return null;

  return <StrategySummaryCard strategy={strategy} density="comfortable" />;
};

const StrategyBindingCallback: React.FC = () => {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const invalidateBindings = useInvalidateStrategyBindings();

  const status = searchParams?.get('status');
  const reason = searchParams?.get('reason');

  const [viewStatus, setViewStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  const { data: bindings } = useStrategyBindingsWithDetailsQuery();

  useEffect(() => {
    if (status === 'success') {
      invalidateBindings();
      setViewStatus('success');
    } else if (status === 'error') {
      setViewStatus('error');
    } else {
      // No status param — invalid callback
      const timer = setTimeout(() => setViewStatus('error'), 500);
      return () => clearTimeout(timer);
    }
  }, [status, invalidateBindings]);

  const getErrorMessage = () => {
    if (!status) return t('strategyBinding.callbackInvalid');
    if (reason === 'user_cancelled')
      return t('strategyBinding.callbackCancelled');
    return t('strategyBinding.callbackError');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)] p-6">
      <div className="max-w-[480px] w-full">
        {viewStatus === 'loading' && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--border-light)] border-t-[var(--color-accent)] rounded-full mx-auto mb-5 animate-spin" />
            <h2 className="text-xl font-semibold theme-text-primary">
              {t('loading')}
            </h2>
          </div>
        )}

        {viewStatus === 'success' && (
          <div className="text-center">
            {/* Success icon */}
            <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 7 11 18 6 13" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold theme-text-primary mb-2">
              {t('strategyBinding.callbackSuccess')}
            </h2>
            <p className="text-sm theme-text-secondary mb-8">
              {t('strategyBinding.callbackSuccessHint')}
            </p>

            {/* Bound strategies list */}
            {bindings && bindings.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {bindings.map((binding) => (
                  <BoundStrategyCard key={binding.id} binding={binding} />
                ))}
              </div>
            )}

            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => router.push('/profile')}
            >
              {t('strategyBinding.backToProfile')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="mt-3"
              onClick={() => router.push('/strategies/bound')}
            >
              {t('strategyBinding.goToBoundStrategies')}
            </Button>
          </div>
        )}

        {viewStatus === 'error' && (
          <div className="text-center">
            {/* Error icon */}
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="20" y1="8" x2="8" y2="20" />
                <line x1="8" y1="8" x2="20" y2="20" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold theme-text-primary mb-2">
              {getErrorMessage()}
            </h2>
            <p className="text-sm theme-text-secondary mb-8">
              {reason === 'user_cancelled'
                ? ''
                : reason
                  ? `Reason: ${reason}`
                  : ''}
            </p>

            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => router.push('/profile')}
            >
              {t('strategyBinding.tryAgain')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBindingCallback;

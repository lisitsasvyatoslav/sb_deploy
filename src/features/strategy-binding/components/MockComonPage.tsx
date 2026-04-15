// TODO [MOCK]: This entire page is a temporary stand-in for comon.ru.
// Remove entirely after integration with the real comon.ru.
// In the real flow the user is redirected to comon.ru/strategies/bind?token=...
// and comon.ru performs the callback via marketplace-backend.

'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import {
  addMockBindings,
  MOCK_COMON_STRATEGIES,
} from '@/features/strategy-binding/mock/data';
import type { TradingStrategyDto } from '@/types/StrategiesCatalog';
import { StrategySummaryCard } from '@/features/strategies-catalog/components/StrategySummaryCard';
import { cn } from '@/shared/utils/cn';

interface StrategySelectCardProps {
  strategy: TradingStrategyDto;
  selected: boolean;
  onToggle: () => void;
}

const StrategySelectCard: React.FC<StrategySelectCardProps> = ({
  strategy,
  selected,
  onToggle,
}) => {
  return (
    <StrategySummaryCard
      as="button"
      strategy={strategy}
      density="comfortable"
      onClick={onToggle}
      className={cn(
        selected
          ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
          : 'border-border-light hover:border-border-medium'
      )}
      footerTrailing={
        <div
          className={cn(
            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors',
            selected
              ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
              : 'bg-transparent border-[var(--border-light)]'
          )}
        >
          {selected && (
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="10 3 4.5 8.5 2 6" />
            </svg>
          )}
        </div>
      }
    />
  );
};

const MockComonPage: React.FC = () => {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callback') ?? '';
  const token = searchParams?.get('token') ?? '';

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleStrategy = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) return;
    // TODO [MOCK]: In the real flow this is done by comon.ru → marketplace-backend → diary-backend
    addMockBindings(Array.from(selectedIds));
    const separator = callbackUrl.includes('?') ? '&' : '?';
    window.location.href = `${callbackUrl}${separator}status=success`;
  };

  const handleCancel = () => {
    const separator = callbackUrl.includes('?') ? '&' : '?';
    window.location.href = `${callbackUrl}${separator}status=error&reason=user_cancelled`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="max-w-[560px] w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium mb-4">
            {t('strategyBinding.mockComon.title')}
          </div>
          <h1 className="text-2xl font-bold theme-text-primary mb-2">
            {t('strategyBinding.mockComon.selectStrategies')}
          </h1>
          <p className="text-sm theme-text-secondary">
            {t('strategyBinding.mockComon.subtitle')}
          </p>
          {token && (
            <p className="text-xs theme-text-secondary mt-1 opacity-50">
              Token: {token.slice(0, 20)}...
            </p>
          )}
        </div>

        {/* Strategy cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {MOCK_COMON_STRATEGIES.map((strategy) => (
            <StrategySelectCard
              key={String(strategy.id)}
              strategy={strategy}
              selected={selectedIds.has(String(strategy.id))}
              onToggle={() => toggleStrategy(String(strategy.id))}
            />
          ))}
        </div>

        {/* Selected count */}
        {selectedIds.size > 0 && (
          <p className="text-sm theme-text-secondary text-center mb-4">
            {t('strategyBinding.mockComon.selected', {
              count: selectedIds.size,
            })}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleCancel}
          >
            {t('strategyBinding.mockComon.cancel')}
          </Button>
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            {t('strategyBinding.mockComon.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockComonPage;

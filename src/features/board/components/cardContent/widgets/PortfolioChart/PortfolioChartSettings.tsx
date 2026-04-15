'use client';

import { useTranslation } from '@/shared/i18n/client';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { Icon } from '@/shared/ui/Icon';
import Checkbox from '@/shared/ui/Checkbox';
import React, { useCallback, useRef, useState } from 'react';
import { BENCHMARK_CATEGORIES } from './constants';
import type { PortfolioChartSettingsData } from './types';

interface PortfolioChartSettingsProps {
  onClose: () => void;
  onSave: (settings: PortfolioChartSettingsData) => void;
  initialSettings?: PortfolioChartSettingsData;
}

export const PortfolioChartSettings: React.FC<PortfolioChartSettingsProps> = ({
  onClose,
  onSave,
  initialSettings,
}) => {
  const { t } = useTranslation('portfolio');
  const panelRef = useRef<HTMLDivElement>(null);

  const [selectedBenchmarks, setSelectedBenchmarks] = useState<Set<string>>(
    new Set(initialSettings?.benchmarks ?? [])
  );

  useClickOutside(panelRef, onClose);

  const toggleBenchmark = useCallback((id: string) => {
    setSelectedBenchmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      ...initialSettings,
      benchmarks: Array.from(selectedBenchmarks),
    });
  }, [onSave, initialSettings, selectedBenchmarks]);

  return (
    <div
      ref={panelRef}
      className="absolute left-0 bottom-0 overflow-clip flex flex-col"
      style={{
        top: 0,
        width: 432,
        maxWidth: '100%',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'var(--surfacelow-surfacelow1, #1c1c1e)',
        border: '1px solid var(--blackinverse-a8, rgba(255,255,255,0.08))',
        borderRadius: 4,
        boxShadow: '0px 20px 76px rgba(0,0,0,0.2)',
        zIndex: 10,
      }}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
        {/* Portfolio selector placeholder */}
        <div className="mb-3">
          <p
            className="mb-1 text-12 leading-4 tracking-tight"
            style={{ color: 'var(--blackinverse-a100)' }}
          >
            {t('chart.portfolio')}
          </p>
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-spacing-8 rounded-radius-2 px-spacing-12 py-spacing-10 opacity-50"
            style={{ background: 'var(--wrapper-a6, rgba(255,255,255,0.08))' }}
          >
            <span
              className="flex-1 truncate text-left text-14 leading-5 tracking-tight"
              style={{ color: 'var(--blackinverse-a100)' }}
            >
              —
            </span>
            <Icon
              variant="chevronDownSmall"
              size={20}
              className="shrink-0 text-blackinverse-a56"
            />
          </button>
        </div>

        {/* Account selector placeholder */}
        <div className="mb-5">
          <p
            className="mb-1 text-12 leading-4 tracking-tight"
            style={{ color: 'var(--blackinverse-a100)' }}
          >
            {t('chart.account')}
          </p>
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-spacing-8 rounded-radius-2 px-spacing-12 py-spacing-10 opacity-50"
            style={{ background: 'var(--wrapper-a6, rgba(255,255,255,0.08))' }}
          >
            <span
              className="flex-1 truncate text-left text-14 leading-5 tracking-tight"
              style={{ color: 'var(--blackinverse-a100)' }}
            >
              —
            </span>
            <span
              className="flex-1 truncate text-right text-12 leading-4 tracking-tight"
              style={{ color: 'var(--blackinverse-a56)' }}
            >
              —
            </span>
            <Icon
              variant="chevronDownSmall"
              size={20}
              className="shrink-0 text-blackinverse-a56"
            />
          </button>
        </div>

        {/* Benchmarks */}
        <div>
          <h3
            className="mb-2 text-base font-semibold"
            style={{ color: 'var(--blackinverse-a100)' }}
          >
            {t('chart.benchmarks.title')}
          </h3>

          {BENCHMARK_CATEGORIES.map((category) => (
            <div key={category.titleKey} className="mb-3">
              <span
                className="mb-1 block text-12 leading-4 tracking-tight"
                style={{ color: 'var(--blackinverse-a100)' }}
              >
                {t(category.titleKey)}
              </span>
              {category.items.map((item) => (
                <div key={item.id} className="py-1">
                  <Checkbox
                    checked={selectedBenchmarks.has(item.id)}
                    onChange={() => toggleBenchmark(item.id)}
                    label={t(item.labelKey)}
                    size="sm"
                    variant="accent"
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Custom benchmark — disabled placeholder */}
          <div className="flex items-center gap-2 py-1">
            <Checkbox checked={false} onChange={() => {}} disabled size="sm" />
            <div
              className="flex-1 rounded-radius-2 px-spacing-8 py-spacing-6 text-12 leading-4 tracking-tight"
              style={{
                background: 'var(--wrapper-a6, rgba(255,255,255,0.08))',
                color: 'var(--blackinverse-a56)',
              }}
            >
              {t('chart.benchmarks.custom')}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-5 pb-5 pt-3">
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-radius-2 py-2.5 text-sm font-semibold"
          style={{
            background: 'var(--blackinverse-a88, rgba(255,255,255,0.88))',
            color: 'var(--whiteinverse-a100, #040405)',
          }}
        >
          {t('chart.save')}
        </button>
      </div>
    </div>
  );
};

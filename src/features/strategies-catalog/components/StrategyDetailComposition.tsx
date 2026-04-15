'use client';

import React, { useState } from 'react';
import Tabs from '@/shared/ui/Tabs';
import { useTranslation } from '@/shared/i18n/client';

interface CompositionItem {
  name: string;
  percent: number;
  color: string;
}

// TODO [MOCK] — состав стратегии должен приходить из отдельного эндпоинта или поля стратегии
const MOCK_ASSETS: CompositionItem[] = [
  { name: 'Акции РФ', percent: 49.3, color: '#8B5CF6' },
  { name: 'Фьючерсы', percent: 16.7, color: '#F59E0B' },
  { name: 'Денежные средства', percent: 10.4, color: '#FBBF24' },
  { name: 'Облигации', percent: 7.8, color: '#EF4444' },
];

const MOCK_SECTORS: CompositionItem[] = [
  { name: 'Энергетика', percent: 49.3, color: '#8B5CF6' },
  { name: 'Материалы', percent: 16.7, color: '#F59E0B' },
  { name: 'Финансы', percent: 10.4, color: '#FBBF24' },
  { name: 'Здоровье', percent: 7.8, color: '#10B981' },
  { name: 'Потребительские товары', percent: 7.8, color: '#3B82F6' },
  { name: 'Недвижимость', percent: 7.8, color: '#EC4899' },
  { name: 'Валюты', percent: 7.8, color: '#6366F1' },
  { name: 'Валюты', percent: 5.9, color: '#14B8A6' },
];

const StrategyDetailComposition: React.FC = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('asset');

  const compositionTabs = [
    { label: t('strategiesCatalog.detail.compositionAsset'), value: 'asset' },
    { label: t('strategiesCatalog.detail.compositionSector'), value: 'sector' },
  ];

  const currentData = activeTab === 'asset' ? MOCK_ASSETS : MOCK_SECTORS;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-14 leading-20 font-semibold text-text-primary">
        {t('strategiesCatalog.detail.compositionTitle')}
      </span>

      <div className="flex flex-col gap-3">
        <Tabs
          tabs={compositionTabs}
          value={activeTab}
          onChange={setActiveTab}
          variant="inverse"
          widthType="fixed"
        />

        {/* Stacked bar */}
        <div className="flex h-4 w-full rounded overflow-hidden gap-[1px]">
          {currentData.map((item) => (
            <div
              key={item.name + item.percent}
              className="rounded"
              style={{
                width: `${item.percent}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {currentData.map((item) => (
            <div
              key={item.name + item.percent}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-12 leading-20 tracking-tight-1 text-blackinverse-a32 truncate max-w-[140px]">
                  {item.name}
                </span>
              </div>
              <span className="text-12 leading-20 tracking-tight-1 text-text-primary">
                {item.percent.toFixed(1).replace('.', ',')} %
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyDetailComposition;

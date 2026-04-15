'use client';

import { useState } from 'react';
import { StrategiesList } from '@/features/strategies-catalog/components/StrategiesList';
import StrategiesTabs from '@/features/strategies-catalog/components/StrategiesTabs';
import { StrategiesTab } from '@/types/StrategiesCatalog';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';

interface StrategiesCatalogPageProps {
  strategiesIds: string[];
}

const StrategiesCatalogPage = ({
  strategiesIds,
}: StrategiesCatalogPageProps) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<StrategiesTab>('current');

  const handleSaveClick = () => {
    console.log('Save selections');
  };

  return (
    <div className="p-7 w-full mx-auto gap-7 flex flex-col max-w-5xl">
      <h1 className="text-3xl font-bold text-text-primary">
        {t('strategiesCatalog.page.title')}
      </h1>
      <div className="flex items-center gap-[12px] px-4 py-3 rounded bg-background-secondary/80">
        <Icon variant="ai" className="text-xl text-[var(--color-accent)]" />
        <p className="text-text-primary text-xs">
          {t('strategiesCatalog.page.profileMatchHint')}
        </p>
      </div>
      <StrategiesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSaveClick={handleSaveClick}
      />
      <StrategiesList strategiesIds={strategiesIds} />
    </div>
  );
};

export default StrategiesCatalogPage;

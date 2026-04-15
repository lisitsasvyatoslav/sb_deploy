import React from 'react';
import Tabs from '@/shared/ui/Tabs';
import Button from '@/shared/ui/Button';
import { StrategiesTab } from '@/types/StrategiesCatalog';
import { useTranslation } from '@/shared/i18n/client';

interface StrategiesTabsProps {
  activeTab: StrategiesTab;
  onTabChange: (tab: StrategiesTab) => void;
  onSaveClick: () => void;
}

const StrategiesTabs: React.FC<StrategiesTabsProps> = ({
  activeTab,
  onTabChange,
  onSaveClick,
}) => {
  const { t } = useTranslation('common');

  const tabs = [
    {
      label: t('strategiesCatalog.tabs.currentSelection'),
      value: 'current',
    },
    {
      label: t('strategiesCatalog.tabs.savedSelections'),
      value: 'saved',
    },
  ];

  return (
    <div className="flex items-center justify-between">
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={(tab: string) => onTabChange(tab as StrategiesTab)}
        variant="inverse"
        size="L"
      />
      <Button variant="accent" size="md" onClick={onSaveClick}>
        {t('strategiesCatalog.tabs.saveSelection')}
      </Button>
    </div>
  );
};

export default StrategiesTabs;

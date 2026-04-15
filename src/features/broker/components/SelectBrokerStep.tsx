/**
 * SelectBrokerStep — Step 1 of broker connection wizard
 *
 * Figma node: 3096:37166
 */

import BrokerIcon from '@/shared/ui/BrokerIcon';
import { Icon } from '@/shared/ui/Icon';
import SearchInput from '@/shared/ui/SearchInput';
import { useTranslation } from '@/shared/i18n/client';
import React, { useMemo, useState } from 'react';
import { getAvailableBrokers } from '../constants';
import WizardTwoPanelLayout from './WizardTwoPanelLayout';

interface SelectBrokerStepProps {
  onSelect: (brokerType: string) => void;
}

const SelectBrokerStep: React.FC<SelectBrokerStepProps> = ({ onSelect }) => {
  const { t } = useTranslation('broker');
  const [searchQuery, setSearchQuery] = useState('');

  const availableBrokers = useMemo(() => getAvailableBrokers(t), [t]);
  const filteredBrokers = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableBrokers;
    }

    const query = searchQuery.toLowerCase();
    return availableBrokers.filter(
      (broker) =>
        broker.name.toLowerCase().includes(query) ||
        broker.url.toLowerCase().includes(query)
    );
  }, [searchQuery, availableBrokers]);

  return (
    <WizardTwoPanelLayout currentStep={1}>
      <div className="flex flex-col gap-spacing-32 max-w-[432px] mx-auto w-full mt-spacing-52">
        {/* Title */}
        <h2 className="text-24 font-semibold text-blackinverse-a100">
          {t('selectStep.title')}
        </h2>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('selectStep.searchPlaceholder')}
          size="md"
        />

        {/* Brokers List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {filteredBrokers.map((broker) => (
              <button
                key={broker.type}
                type="button"
                onClick={() => broker.enabled && onSelect(broker.type)}
                disabled={!broker.enabled}
                className={`flex items-center justify-between py-spacing-8 px-spacing-10 border-t border-stroke-a6 first:border-t-0 transition-all ${
                  broker.enabled
                    ? 'cursor-pointer hover:opacity-80'
                    : 'opacity-statedisabled cursor-not-allowed'
                }`}
              >
                {/* Broker Icon + Name */}
                <div className="flex items-center gap-spacing-6 p-spacing-4 flex-1">
                  <BrokerIcon broker={broker.type} size={24} />
                  <span className="text-12 font-medium text-blackinverse-a100">
                    {broker.name}
                  </span>
                </div>

                {/* Connect Arrow */}
                {broker.enabled && (
                  <div className="flex items-center gap-spacing-2 py-spacing-4 px-spacing-6 rounded-radius-2 text-blackinverse-a56">
                    <span className="text-12 font-medium">
                      {t('selectStep.connectButton')}
                    </span>
                    <Icon variant="chevronRight" size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredBrokers.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-14 text-blackinverse-a32">
              {t('selectStep.notFound')}
            </span>
          </div>
        )}
      </div>
    </WizardTwoPanelLayout>
  );
};

export default SelectBrokerStep;

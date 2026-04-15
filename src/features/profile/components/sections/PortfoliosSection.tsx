'use client';

import React from 'react';
import ConnectedBrokers from '@/features/broker/components/ConnectedBrokers';
import BindComonButton from '@/features/strategy-binding/components/BindComonButton';
import BoundStrategiesList from '@/features/strategy-binding/components/BoundStrategiesList';
import { StrategyBindingFeatureGate } from '@/features/strategy-binding/components/StrategyBindingFeatureGate';
import { useStatisticsStore } from '@/stores/statisticsStore';

const PortfoliosSection: React.FC = () => {
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const setSelectedAccountIds = useStatisticsStore(
    (state) => state.setSelectedAccountIds
  );

  const handleAddBroker = () => {
    setShowBrokerDialog(true);
  };

  return (
    <div className="flex flex-col gap-6 w-[560px]">
      <ConnectedBrokers
        onAddBroker={handleAddBroker}
        onAllBrokersDeleted={() => setSelectedAccountIds(null)}
      />
      <StrategyBindingFeatureGate>
        <BindComonButton />
        <BoundStrategiesList />
      </StrategyBindingFeatureGate>
    </div>
  );
};

export default PortfoliosSection;

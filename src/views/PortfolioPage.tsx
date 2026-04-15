'use client';

import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import AddBrokerDialog from '@/features/broker/components/AddBrokerDialog';
import BrokerManagementDialog from '@/features/broker/components/BrokerManagementDialog';
import { useBrokerConnectionsQuery } from '@/features/broker/queries';
import PositionsTable from '@/features/statistics/components/PositionsTable';
import WidgetPlaceholder from '@/features/statistics/components/WidgetPlaceholder';
import {
  usePortfolioValueHistoryQuery,
  useSyncAllMutation,
} from '@/features/statistics/queries';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { PeriodType } from '@/types';

const ProfitabilityChart = lazy(
  () => import('@/features/statistics/components/ProfitabilityChart')
);

const PortfolioPage: React.FC = () => {
  const { data: connections, isLoading } = useBrokerConnectionsQuery();
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const showBrokerManagementDialog = useStatisticsStore(
    (state) => state.showBrokerManagementDialog
  );
  const setShowBrokerManagementDialog = useStatisticsStore(
    (state) => state.setShowBrokerManagementDialog
  );

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');

  const { data: portfolioData, isLoading: isLoadingPortfolio } =
    usePortfolioValueHistoryQuery({ period: selectedPeriod });

  const hasConnections = connections && connections.length > 0;

  const syncMutation = useSyncAllMutation();
  const hasSyncedOnMount = useRef(false);

  useEffect(() => {
    if (!isLoading && hasConnections && !hasSyncedOnMount.current) {
      hasSyncedOnMount.current = true;
      syncMutation.mutate();
    }
  }, [isLoading, hasConnections]);

  useEffect(() => {
    if (!isLoading && !hasConnections) {
      setShowBrokerDialog(true);
    }
  }, [isLoading, hasConnections, setShowBrokerDialog]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  return (
    <>
      <div className="w-full h-full px-8 flex flex-col pt-10">
        <div
          className="max-w-[1920px] mx-auto w-full flex-1 flex flex-col gap-2 min-h-0 py-10"
          data-main-content
        >
          {/* Chart + Widget Grid - фиксированная высота */}
          <div className="grid grid-cols-6 gap-2 h-[300px] flex-shrink-0">
            {/* Chart - 2/3 on small screens, 1/2 on large screens */}
            <div className="col-span-4 lg:col-span-3">
              <Suspense
                fallback={
                  <div className="h-64 animate-pulse bg-[var(--bg-secondary)] rounded-2xl" />
                }
              >
                <ProfitabilityChart
                  data={portfolioData || null}
                  isLoading={isLoadingPortfolio}
                  onPeriodChange={handlePeriodChange}
                  selectedPeriod={selectedPeriod}
                />
              </Suspense>
            </div>

            {/* Widget Placeholder - 1/3 on small screens, 1/2 on large screens */}
            <div className="col-span-2 lg:col-span-3 min-w-[240px]">
              <WidgetPlaceholder />
            </div>
          </div>

          {/* Positions Table - занимает оставшееся пространство */}
          <PositionsTable className="flex-1 overflow-hidden min-h-0 self-stretch" />
        </div>
      </div>

      {/* Broker Connection Dialog */}
      <AddBrokerDialog />

      {/* Broker Management Dialog */}
      <BrokerManagementDialog
        open={showBrokerManagementDialog}
        onClose={() => setShowBrokerManagementDialog(false)}
      />
    </>
  );
};

export default PortfolioPage;

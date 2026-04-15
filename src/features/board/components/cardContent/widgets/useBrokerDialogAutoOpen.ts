import { useBrokerConnectionsQuery } from '@/features/broker/queries';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useEffect } from 'react';

export function useBrokerDialogAutoOpen(): void {
  const { data: connections, isLoading } = useBrokerConnectionsQuery();
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );

  const hasConnections = connections && connections.length > 0;

  useEffect(() => {
    if (!isLoading && !hasConnections) {
      setShowBrokerDialog(true);
    }
  }, [isLoading, hasConnections, setShowBrokerDialog]);
}

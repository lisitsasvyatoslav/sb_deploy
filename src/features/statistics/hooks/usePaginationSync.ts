import { useStatisticsStore } from '@/stores/statisticsStore';
import { useEffect } from 'react';

/**
 * Syncs pagination metadata from a query response into the statistics store.
 * Only updates when data arrives — never clears to null during refetch,
 * preventing pagination UI from flickering on page change.
 */
export const usePaginationSync = (
  pagination: { totalPages: number; totalCount: number } | undefined
) => {
  const setPaginationMeta = useStatisticsStore(
    (state) => state.setPaginationMeta
  );

  useEffect(() => {
    if (pagination) {
      setPaginationMeta({
        totalPages: pagination.totalPages,
        totalCount: pagination.totalCount,
      });
    }
  }, [pagination, setPaginationMeta]);
};

import { strategyCatalogApi } from '@/services/api/strategiesCatalog';
import { useQuery } from '@tanstack/react-query';

export const useGetStrategyCatalogById = (id: number | string) => {
  return useQuery({
    queryKey: ['strategyCatalog', id],
    queryFn: () => strategyCatalogApi.getStrategy(id),
    staleTime: 1000 * 30,
  });
};

export interface ProfitPointsFilter {
  From?: string;
  To?: string;
  lastPoints?: number;
}

export const useGetProfitPoints = (
  id: number | string,
  filter?: ProfitPointsFilter
) => {
  return useQuery({
    queryKey: ['profitPoints', id, filter],
    queryFn: () => strategyCatalogApi.getProfitPoints(id, filter),
    staleTime: 1000 * 30,
  });
};

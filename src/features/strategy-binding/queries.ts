import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { strategyBindingApi } from '@/services/api';

export const strategyBindingQueryKeys = {
  all: ['strategy-bindings'] as const,
  list: () => [...strategyBindingQueryKeys.all, 'list'] as const,
  listWithDetails: () =>
    [...strategyBindingQueryKeys.all, 'list-with-details'] as const,
};

export const useStrategyBindingsQuery = () => {
  return useQuery({
    queryKey: strategyBindingQueryKeys.list(),
    queryFn: () => strategyBindingApi.listBindings(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useStrategyBindingsWithDetailsQuery = () => {
  return useQuery({
    queryKey: strategyBindingQueryKeys.listWithDetails(),
    queryFn: () => strategyBindingApi.listBindingsWithDetails(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInitStrategyBindingMutation = () => {
  return useMutation({
    mutationFn: () => strategyBindingApi.initBinding(),
  });
};

/**
 * Hook to invalidate cache after binding.
 * Invoked on the callback page when status=success.
 */
export const useInvalidateStrategyBindings = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: strategyBindingQueryKeys.all,
    });
  };
};

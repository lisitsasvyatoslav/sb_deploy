import { strategyApi } from '@/services/api/strategies';
import { deploymentApi } from '@/services/api/deployments';
import type {
  UpdateStrategyRequest,
  DeployStrategyRequest,
  DeploySSEEvent,
  PublishToMarketplaceRequest,
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const strategyQueryKeys = {
  all: ['strategies'] as const,
  byBoard: (boardId: number) =>
    [...strategyQueryKeys.all, 'board', boardId] as const,
  detail: (id: number) => [...strategyQueryKeys.all, id] as const,
};

export const useStrategiesQuery = (boardId: number) => {
  return useQuery({
    queryKey: strategyQueryKeys.byBoard(boardId),
    queryFn: () => strategyApi.getStrategies(boardId),
    staleTime: 1000 * 30,
    enabled: boardId > 0,
  });
};

export const useStrategyQuery = (id: number | undefined) => {
  return useQuery({
    queryKey: strategyQueryKeys.detail(id!),

    queryFn: () => strategyApi.getStrategy(id!),
    staleTime: 1000 * 30,
    enabled: !!id && id > 0,
  });
};

export const useUpdateStrategyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStrategyRequest }) =>
      strategyApi.updateStrategy(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(strategyQueryKeys.detail(updated.id), updated);
      if (updated.boardId) {
        queryClient.invalidateQueries({
          queryKey: strategyQueryKeys.byBoard(updated.boardId),
        });
      }
    },
  });
};

export const useDeleteStrategyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => strategyApi.deleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyQueryKeys.all });
    },
  });
};

export const usePublishToMarketplaceMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: PublishToMarketplaceRequest;
    }) => strategyApi.publishToMarketplace(id, data),
  });
};

export const deploymentQueryKeys = {
  all: ['deployments'] as const,
  byStrategy: (strategyId: number) =>
    [...deploymentQueryKeys.all, 'strategy', strategyId] as const,
  detail: (strategyId: number, deploymentId: number) =>
    [...deploymentQueryKeys.all, strategyId, deploymentId] as const,
  ideas: (strategyId: number, deploymentId: number) =>
    [...deploymentQueryKeys.all, strategyId, deploymentId, 'ideas'] as const,
};

export const useDeploymentsQuery = (strategyId: number | undefined) => {
  return useQuery({
    queryKey: deploymentQueryKeys.byStrategy(strategyId!),
    queryFn: () => deploymentApi.getDeployments(strategyId!),
    staleTime: 1000 * 30,
    enabled: !!strategyId && strategyId > 0,
  });
};

export const useDeploymentIdeasQuery = (
  strategyId: number | undefined,
  deploymentId: number | undefined
) => {
  return useQuery({
    queryKey: deploymentQueryKeys.ideas(strategyId!, deploymentId!),
    queryFn: () => deploymentApi.getIdeas(strategyId!, deploymentId!),
    staleTime: 1000 * 30,
    enabled:
      !!strategyId && !!deploymentId && strategyId > 0 && deploymentId > 0,
  });
};

export const useDeployStrategyMutation = (strategyId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      onEvent,
      dto,
    }: {
      onEvent: (event: DeploySSEEvent) => void;
      dto?: DeployStrategyRequest;
    }) => deploymentApi.deploy(strategyId, onEvent, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deploymentQueryKeys.byStrategy(strategyId),
      });
    },
  });
};

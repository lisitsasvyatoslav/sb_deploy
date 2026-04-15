import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { portfolioApi } from '@/services/api/portfolio';
import { statisticsApi } from '@/services/api/statistics';
import type {
  CreatePortfolioRequest,
  PortfolioResponse,
  PortfolioWithSummaryResponse,
  UpdatePortfolioRequest,
} from '@/types/portfolio';

export interface AccountSummaryItem {
  brokerType: string;
  connectionId: number | null;
  accountId: string | null;
  marketValue: number;
  currency: string | null;
}

export const portfolioCatalogQueryKeys = {
  all: () => ['portfolios'] as const,
  portfoliosWithSummary: () => ['portfolios', 'with-summary'] as const,
  portfolioDetail: (id: number) => ['portfolios', 'detail', id] as const,
  boardPortfolioSettings: (boardId: number) =>
    ['portfolios', 'board-settings', boardId] as const,
  accountsSummary: () => ['accounts', 'summary'] as const,
};

/**
 * Query: Get all portfolios with summary metrics (totalValue, PnL, positionCount)
 */
export const usePortfoliosWithSummaryQuery = (): UseQueryResult<
  PortfolioWithSummaryResponse[],
  Error
> => {
  return useQuery({
    queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
    queryFn: () => portfolioApi.getPortfoliosWithSummary(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((p) => !p.hasSnapshot)) {
        return 3000; // Poll every 3s while any portfolio snapshot is being created
      }
      return false;
    },
  });
};

/**
 * Query: Get all portfolios (lightweight, for wizard filtering)
 */
export const usePortfoliosQuery = (): UseQueryResult<
  PortfolioResponse[],
  Error
> => {
  return useQuery({
    queryKey: portfolioCatalogQueryKeys.all(),
    queryFn: () => portfolioApi.getPortfolios(),
    staleTime: 1000 * 60,
  });
};

/**
 * Query: Get aggregated market value per broker/account from latest snapshot
 */
export const useAccountsSummaryQuery = (): UseQueryResult<
  AccountSummaryItem[],
  Error
> => {
  return useQuery({
    queryKey: portfolioCatalogQueryKeys.accountsSummary(),
    queryFn: () => statisticsApi.getAccountsSummary(),
    staleTime: 1000 * 60,
  });
};

/**
 * Mutation: Delete a portfolio by ID
 */
export const useDeletePortfolioMutation = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: number) =>
      portfolioApi.deletePortfolio(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
    },
  });
};

export const usePortfolioDetailQuery = (
  portfolioId: number | null,
  enabled: boolean
): UseQueryResult<PortfolioResponse, Error> => {
  return useQuery({
    queryKey:
      portfolioId != null
        ? portfolioCatalogQueryKeys.portfolioDetail(portfolioId)
        : ['portfolios', 'detail', 'none'],
    queryFn: () => portfolioApi.getPortfolio(portfolioId!),
    enabled: enabled && portfolioId != null,
    staleTime: 1000 * 30,
  });
};

/**
 * Board → linked catalog portfolio (positions filter / statistics). Shared cache avoids duplicate GET board-settings per page.
 */
export const useBoardPortfolioSettingsQuery = (
  boardId: number,
  options?: { enabled?: boolean }
): UseQueryResult<
  { portfolioId: number | null; portfolioName: string | null },
  Error
> => {
  return useQuery({
    queryKey: portfolioCatalogQueryKeys.boardPortfolioSettings(boardId),
    queryFn: () => portfolioApi.getBoardPortfolioSettings(boardId),
    staleTime: 1000 * 30,
    enabled: options?.enabled !== false && boardId > 0,
  });
};

export const useCreateInstrumentPortfolioMutation = (): UseMutationResult<
  PortfolioResponse,
  Error,
  CreatePortfolioRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePortfolioRequest) =>
      portfolioApi.createPortfolio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
    },
  });
};

export const useUpdateInstrumentPortfolioMutation = (): UseMutationResult<
  PortfolioResponse,
  Error,
  { id: number; data: UpdatePortfolioRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioRequest }) =>
      portfolioApi.updatePortfolio(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfolioDetail(variables.id),
      });
    },
  });
};

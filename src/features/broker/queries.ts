import { brokerApi } from '@/services/api/broker';
import { invalidateAllStatisticsQueries } from '@/features/statistics/queries';
import { portfolioCatalogQueryKeys } from '@/features/portfolio-catalog/queries';
import type {
  BrokerConnection,
  BrokerConnectionUpdateRequest,
  BrokerConnectionWithAccountsResponse,
  CreateBrokerConnectionRequest,
  TradingAccount,
} from '@/types';
import type { BrokerTypeInfo } from '@/types/broker';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

/**
 * Query Keys для broker module
 * Переиспользуются в разных частях приложения
 */
export const brokerQueryKeys = {
  accounts: () => ['broker-accounts'] as const,
  connections: () => ['broker-connections'] as const,
  balances: (connectionId: number | null) =>
    ['broker-balances', connectionId] as const,
};

/**
 * Query: Get all trading accounts for current user
 * Returns ALL accounts including duplicates (same account_id in different connections)
 *
 * Use cases:
 * - Statistics filter (with deduplication via transformAccountsToBrokers)
 * - Broker management page (without deduplication, show all connections)
 * - Settings page (account sync configuration)
 */
export const useBrokerAccountsQuery = (): UseQueryResult<
  TradingAccount[],
  Error
> => {
  return useQuery({
    queryKey: brokerQueryKeys.accounts(),
    queryFn: () => brokerApi.getAccounts(),
    staleTime: 1000 * 60 * 5, // 5 minutes (rarely updated)
  });
};

/**
 * Query: Get all broker connections for current user
 */
export const useBrokerConnectionsQuery = (options?: {
  enabled?: boolean;
}): UseQueryResult<BrokerConnection[], Error> => {
  return useQuery({
    queryKey: brokerQueryKeys.connections(),
    queryFn: () => brokerApi.getConnections(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled,
  });
};

/**
 * Mutation: Validate credentials and discover accounts (no DB writes).
 * Used by wizard step 2.
 */
export const useValidateBrokerConnectionMutation = () => {
  return useMutation({
    mutationFn: (data: {
      brokerCode: string;
      credentials: Record<string, unknown>;
    }) => brokerApi.validateConnection(data),
  });
};

/**
 * Mutation: Create a new broker connection with validation
 *
 * Returns connection data with synced trading accounts.
 *
 * On success:
 * - Invalidates broker connections query (refetch connections list)
 * - Invalidates broker accounts query (refetch accounts list)
 */
export const useCreateBrokerConnectionMutation = (): UseMutationResult<
  BrokerConnectionWithAccountsResponse,
  Error,
  CreateBrokerConnectionRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrokerConnectionRequest) =>
      brokerApi.createConnection(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
    },
  });
};

/**
 * Mutation: Update an existing broker connection
 *
 * Can update:
 * - connection_name: Display name
 * - credentials: API tokens/keys
 * - is_active: Enable/disable connection
 * - sync_depth_years: Depth of sync in years (1-10)
 *
 * On success:
 * - Invalidates broker connections query (refetch connections list)
 */
export const useUpdateBrokerConnectionMutation = (): UseMutationResult<
  BrokerConnection,
  Error,
  { connectionId: number; data: BrokerConnectionUpdateRequest }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connectionId,
      data,
    }: {
      connectionId: number;
      data: BrokerConnectionUpdateRequest;
    }) => brokerApi.updateConnection(connectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
    },
  });
};

/**
 * Mutation: Delete all broker connections and accounts by broker type
 *
 * Deletes all connections of a specific broker type (e.g., 'finam', 'alpaca')
 * and their associated trading accounts.
 *
 * On success:
 * - Invalidates broker connections query (refetch connections list)
 * - Invalidates broker accounts query (refetch accounts list)
 */
export const useDeleteBrokerAccountsMutation = (): UseMutationResult<
  { deleted: number },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brokerType: string) =>
      brokerApi.deleteBrokerAccounts(brokerType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
    },
  });
};

export const useDeleteBrokerConnectionMutation = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) =>
      brokerApi.deleteConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
      invalidateAllStatisticsQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
    },
  });
};

export const useDeleteAccountMutation = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) => brokerApi.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
      invalidateAllStatisticsQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: portfolioCatalogQueryKeys.portfoliosWithSummary(),
      });
    },
  });
};

// ============================================================================
// Account Balances
// ============================================================================

/**
 * Query: Get account balances for a broker connection.
 * Used in wizard step 3 to display account amounts.
 */
export const useConnectionBalancesQuery = (connectionId: number | null) => {
  return useQuery({
    queryKey: brokerQueryKeys.balances(connectionId),
    queryFn: () => brokerApi.getConnectionBalances(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
};

// ============================================================================
// SnapTrade Portal Flow
// ============================================================================

/**
 * Query: Get available broker types from reference table
 */
export const useBrokerTypesQuery = (): UseQueryResult<
  BrokerTypeInfo[],
  Error
> => {
  return useQuery({
    queryKey: ['broker-types'] as const,
    queryFn: () => brokerApi.getBrokerTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes (rarely changes)
  });
};

/**
 * Mutation: Register user in SnapTrade and get portal URL
 *
 * Returns redirectURI for the Connection Portal and connectionId.
 * User should be redirected to redirectURI to link their brokerage.
 */
export const useSnapTradeRegisterMutation = (): UseMutationResult<
  { redirectURI: string; connectionId: number },
  Error,
  void
> => {
  return useMutation({
    mutationFn: () => brokerApi.snaptradeRegister(),
  });
};

/**
 * Mutation: Process SnapTrade portal completion
 *
 * Called after user completes the SnapTrade Connection Portal.
 * Fetches accounts from SnapTrade and activates the connection.
 *
 * On success:
 * - Invalidates broker connections query
 * - Invalidates broker accounts query
 */
export const useSnapTradeCallbackMutation = (): UseMutationResult<
  BrokerConnectionWithAccountsResponse,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) =>
      brokerApi.snaptradeCallback(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
    },
  });
};

/**
 * Mutation: Get new portal URL for existing connection (reconnect)
 */
export const useSnapTradePortalUrlMutation = (): UseMutationResult<
  { redirectURI: string },
  Error,
  number
> => {
  return useMutation({
    mutationFn: (connectionId: number) =>
      brokerApi.snaptradePortalUrl(connectionId),
  });
};

// ============================================================================
// CSV Trade Import
// ============================================================================

/**
 * Mutation: Import trades from CSV file
 *
 * On success:
 * - Invalidates broker accounts query (new csv_import account may appear)
 * - Invalidates broker connections query
 */
export const useImportTradesMutation = (): UseMutationResult<
  { imported: number; duplicates: number; total: number; errors: string[] },
  Error,
  File
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => brokerApi.importTrades(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: brokerQueryKeys.connections(),
      });
      queryClient.invalidateQueries({ queryKey: brokerQueryKeys.accounts() });
      invalidateAllStatisticsQueries(queryClient);
    },
  });
};

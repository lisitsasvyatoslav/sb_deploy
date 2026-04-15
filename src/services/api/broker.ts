import type {
  BrokerConnection,
  BrokerConnectionWithAccountsResponse,
  BrokerConnectionUpdateRequest,
  CreateBrokerConnectionRequest,
  BrokerTypeInfo,
  TradingAccount,
} from '@/types/broker';
import { apiClient } from './client';

/**
 * API client for broker module
 * Handles broker connections and trading accounts
 */
export const brokerApi = {
  /**
   * Get available broker types from reference table
   *
   * @returns Promise with list of broker types
   */
  async getBrokerTypes(): Promise<BrokerTypeInfo[]> {
    const response = await apiClient.get('/broker/types');
    return response.data;
  },

  /**
   * Validate credentials and discover accounts (no DB writes)
   */
  async validateConnection(data: {
    brokerCode: string;
    credentials: Record<string, unknown>;
  }): Promise<import('@/types/broker').ValidateBrokerConnectionResponse> {
    const response = await apiClient.post('/broker/connections/validate', data);
    return response.data;
  },

  /**
   * Get all trading accounts for current user
   * Returns ALL accounts including duplicates (same account_id in different connections)
   *
   * @returns Promise with list of trading accounts
   */
  async getAccounts(): Promise<TradingAccount[]> {
    const response = await apiClient.get('/broker/accounts');
    return response.data;
  },

  /**
   * Get all broker connections for current user
   *
   * @returns Promise with list of broker connections
   */
  async getConnections(): Promise<BrokerConnection[]> {
    const response = await apiClient.get('/broker/connections');
    return response.data;
  },

  /**
   * Create a new broker connection with validation and fetch trading accounts
   *
   * @param data - Broker connection data (broker code, credentials, optional name)
   * @returns Promise with connection and synced trading accounts
   */
  async createConnection(
    data: CreateBrokerConnectionRequest
  ): Promise<BrokerConnectionWithAccountsResponse> {
    const response = await apiClient.post('/broker/connections', data);
    return response.data;
  },

  /**
   * Update an existing broker connection
   *
   * @param connectionId - Connection ID to update
   * @param data - Update data (name, credentials, sync settings, etc.)
   * @returns Promise with updated connection
   */
  async updateConnection(
    connectionId: number,
    data: BrokerConnectionUpdateRequest
  ): Promise<BrokerConnection> {
    const response = await apiClient.put(
      `/broker/connections/${connectionId}`,
      data
    );
    return response.data;
  },

  /**
   * Trigger manual sync for a broker connection
   * Fetches accounts and positions from broker API
   *
   * @param connectionId - Connection ID to sync
   * @returns Promise with list of synced trading accounts
   */
  async syncConnection(connectionId: number): Promise<TradingAccount[]> {
    const response = await apiClient.post(
      `/broker/connections/${connectionId}/sync-accounts`
    );
    return response.data;
  },

  /**
   * Enable auto-sync for all trading accounts in a broker connection
   * Configures periodic automatic data synchronization
   *
   * @param connectionId - Connection ID
   * @param enabled - Enable or disable auto-sync
   * @returns Promise with auto-sync status
   */
  async enableAutoSync(
    connectionId: number,
    enabled = true
  ): Promise<{
    status: string;
    connection_id: number;
    auto_sync_enabled: boolean;
    accounts_updated: number;
  }> {
    const response = await apiClient.put(
      `/broker/connections/${connectionId}/auto-sync?enabled=${enabled}`
    );
    return response.data;
  },

  /**
   * Delete all broker connections and accounts by broker code
   * Deletes all connections of a specific broker and their associated trading accounts
   *
   * @param brokerCode - Broker code (e.g., 'finam')
   * @returns Promise with number of connections deleted
   */
  async deleteBrokerAccounts(brokerCode: string): Promise<{ deleted: number }> {
    const response = await apiClient.delete(
      `/broker/accounts/by-broker/${brokerCode}`
    );
    return response.data;
  },

  /**
   * Delete a single broker connection and all its accounts + related data
   */
  async deleteConnection(connectionId: number): Promise<void> {
    await apiClient.delete(`/broker/connections/${connectionId}`);
  },

  /**
   * Delete a single trading account and all its related data
   */
  async deleteAccount(accountId: number): Promise<void> {
    await apiClient.delete(`/broker/accounts/${accountId}`);
  },

  /**
   * Get account balances for all accounts of a connection
   */
  async getConnectionBalances(
    connectionId: number
  ): Promise<import('@/types/broker').AccountBalance[]> {
    const response = await apiClient.get(
      `/broker/connections/${connectionId}/balances`
    );
    return response.data;
  },

  // SnapTrade Portal Flow

  async snaptradeRegister(): Promise<{
    redirectURI: string;
    connectionId: number;
  }> {
    const response = await apiClient.post('/broker/snaptrade/register', {
      redirectUrl: window.location.origin,
    });
    return response.data;
  },

  async snaptradeCallback(
    connectionId: number
  ): Promise<BrokerConnectionWithAccountsResponse> {
    const response = await apiClient.post('/broker/snaptrade/callback', {
      connectionId,
    });
    return response.data;
  },

  async snaptradePortalUrl(
    connectionId: number
  ): Promise<{ redirectURI: string }> {
    const response = await apiClient.post('/broker/snaptrade/portal-url', {
      connectionId,
      redirectUrl: window.location.origin,
    });
    return response.data;
  },

  // CSV Trade Import

  async importTrades(file: File): Promise<{
    imported: number;
    duplicates: number;
    total: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      '/statistics/import-trades',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};

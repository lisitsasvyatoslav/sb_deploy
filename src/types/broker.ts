import type React from 'react';

/**
 * Broker module types
 */

/**
 * Available broker type from API (/api/broker/types)
 */
export interface BrokerTypeInfo {
  code: string;
  name: string;
  isEnabled: boolean;
}

/**
 * Trading account from API (/api/broker/accounts)
 * Raw data from backend, may contain duplicates
 */
export interface TradingAccount {
  id: number;
  connectionId: number;
  brokerType: string;
  accountId: string;
  accountName: string | null;
  institutionName: string | null;
  isActive: boolean;
  autoSync: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Account balance from API (/api/broker/connections/:id/balances)
 */
export interface AccountBalance {
  accountId: string;
  balances: Record<string, string>;
}

/**
 * Discovered account from validate endpoint (not persisted in DB yet)
 */
export interface DiscoveredAccount {
  accountId: string;
  accountName: string;
  brokerType: string;
  institutionName: string | null;
  balances: Record<string, string>;
}

export interface ValidateBrokerConnectionRequest {
  brokerCode: string;
  credentials: Record<string, unknown>;
}

export interface ValidateBrokerConnectionResponse {
  accounts: DiscoveredAccount[];
  /**
   * Account IDs already persisted under a connection with the same credentials.
   * Used to disable these rows in the create-portfolios wizard step so the user
   * doesn't re-add accounts that are already attached to their token.
   */
  existingAccountIds: string[];
}

/**
 * Broker connection from API (/api/broker/connections)
 */
export interface BrokerConnection {
  id: number;
  userId: string;
  brokerCode: string;
  brokerName: string;
  /** @deprecated Use brokerCode */
  brokerType: string;
  connectionName: string | null;
  status: 'active' | 'inactive' | 'expired' | 'revoked' | 'pending';
  /** @deprecated Use status === 'active' */
  isActive: boolean;
  maskedKey: string | null;
  syncDepthYears: number;
  credentialsSetAt: string | null;
  lastValidatedAt: string | null;
  statusReason: string | null;
  credentialsExpiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response when creating a new broker connection
 * Includes connection data and synced trading accounts
 */
export interface BrokerConnectionWithAccountsResponse {
  connection: BrokerConnection;
  accounts: TradingAccount[];
  /**
   * True when the backend reused an existing connection (same credentials) and
   * merged accounts into it instead of creating a new row. The wizard uses this
   * flag to avoid deleting the pre-existing connection as an "orphan" on close.
   */
  isExisting: boolean;
}

/**
 * Broker account for UI (after deduplication)
 * Used in filters with composite key format: "broker_type:account_id"
 */
export interface BrokerAccount {
  id: string; // Composite key: "broker_type:account_id" (e.g. "finam:ABC123")
  name: string; // Display name: "Основной счет", "ИИС"
  brokerType: string; // Broker type: "finam", "tinkoff", "demo"
}

/**
 * Broker for UI display (grouped accounts by broker type)
 */
export interface Broker {
  type: string; // Broker type: "finam", "tinkoff"
  name: string; // Display name: "Финам", "Т-инвест"
  url: string; // Broker website URL for display
  icon: string; // Broker type identifier (used by BrokerIcon component)
  accounts: BrokerAccount[];
}

/**
 * Broker-specific credential types
 */

// Finam: только API secret
export interface FinamCredentials {
  secret: string;
}

// Tinkoff: API token
export interface TinkoffCredentials {
  token: string;
}

// Interactive Brokers: username, password, account
export interface InteractiveBrokersCredentials {
  username: string;
  password: string;
  account: string;
}

/**
 * Base request to create a new broker connection
 * Generic structure that works for all brokers
 */
export interface CreateBrokerConnectionRequest {
  brokerCode: string;
  connectionName?: string;
  credentials: Record<string, unknown>;
  selectedAccountIds?: string[];
}

/**
 * Request to update an existing broker connection
 */
export interface BrokerConnectionUpdateRequest {
  connectionName?: string;
  credentials?: Record<string, unknown>;
  status?: 'active' | 'inactive';
  syncDepthYears?: number;
  autoSyncEnabled?: boolean;
}

/**
 * Type-safe broker connection requests
 * Use these for type safety when you know the specific broker
 */
export type TypedBrokerConnectionRequest =
  | {
      brokerCode: 'finam';
      credentials: FinamCredentials;
      connectionName?: string;
    }
  | {
      brokerCode: 't-invest';
      credentials: TinkoffCredentials;
      connectionName?: string;
    }
  | {
      brokerCode: 'interactive_brokers';
      credentials: InteractiveBrokersCredentials;
      connectionName?: string;
    };

/**
 * Credential field configuration for broker forms
 */
export interface CredentialFieldConfig {
  name: string; // Field name (key in credentials object)
  label: string; // Label text
  type: 'text' | 'password' | 'email';
  placeholder: string;
  required: boolean;
  helpText?: string; // Optional help text/link
  useTextArea?: boolean; // Render as multi-line TextArea (for long tokens)
}

/**
 * Available broker info for selection
 */
export interface BrokerInfo {
  type: string; // Broker type: "finam", "tinkoff", etc.
  name: string; // Display name: "Финам"
  url: string; // Broker website URL
  icon: string; // Icon identifier
  enabled: boolean; // Is this broker available for connection
  connectionType?: 'token' | 'portal'; // 'portal' for SnapTrade (redirect flow), 'token' for direct API key entry
  credentialFields: CredentialFieldConfig[]; // Fields for connection form
  howToDoDescription?: React.ReactNode; // Broker-specific instruction text for "How to do it" section
  notClientDescription?: React.ReactNode; // Broker-specific text for "I'm not a client" section
  tokenManual?: {
    parts: Array<{
      title: string;
      subtitle?: string;
      steps: React.ReactNode[];
      screenshotSrc?: string;
    }>;
  } | null;
}

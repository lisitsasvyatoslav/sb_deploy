/**
 * Signal types for webhook integration (TradingView, Telegram)
 */

export enum SignalSourceType {
  TRADINGVIEW = 'tradingview',
  TELEGRAM = 'telegram',
}

// Signal webhook configuration
export interface SignalWebhook {
  id: number;
  boardId: number;
  sourceType: SignalSourceType;
  webhookUrl: string;
  description?: string;
  active: boolean;
  showToastNotification: boolean;
}

// Received webhook signal
export interface Signal {
  id: number;
  signalWebhookId: number;
  payload: Record<string, unknown>;
  createdAt: string;
  securityId?: number; // Опциональное поле
}

export interface CreateSignalWebhookRequest {
  boardId: number;
  sourceType: SignalSourceType;
  secretToken?: string; // Pre-generated secret token
  description?: string;
  showToastNotification?: boolean;
}

export interface UpdateSignalWebhookRequest {
  description?: string;
  active?: boolean;
  showToastNotification?: boolean;
}

export interface SignalWebhookListResponse {
  signals: SignalWebhook[];
  total: number;
}

export interface SignalListResponse {
  data: Signal[];
  total: number;
}

// TradingView payload structure (flexible)
export interface TradingViewPayload {
  ticker?: string;
  price?: number;
  message?: string;
  time?: string;
  [key: string]: unknown; // Allow any additional fields
}

export interface GeneratedUrl {
  secretToken: string;
  webhookUrl: string;
}

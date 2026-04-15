import { CardType, Position } from './common';
import { Tag } from './tag';

// ========== REACTFLOW TYPES ==========
export interface ReactFlowNode {
  id: string; // ReactFlow requires string ID
  type: string;
  position: Position;
  data: Record<string, unknown>;
  zIndex?: number; // Z-index for card layers
}

// ========== BOARD ==========
export interface BoardTicker {
  symbol: string;
  securityId?: number;
}

export interface Board {
  id: number;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  cardCount?: number;
  cards?: Card[];
  /** Set when board was created from a section template (API). */
  template?: 'portfolio' | 'strategy';
  /** Unique tickers extracted from cards on this board (max 5). */
  tickers?: BoardTicker[];
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  template?: 'portfolio' | 'strategy';
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
}

// ========== WIDGET ==========
export type WidgetType =
  | 'portfolio_chart'
  | 'positions_table'
  | 'ticker_adder'
  | 'ticker_card'
  | 'ai_screener'
  | 'news_feed'
  | 'screener_forecast'
  | 'ticker_graph'
  | 'strategy_output_ideas'
  | 'strategy_checklist';

// ========== CARD META ==========
/** Typed meta fields for Card. Allows arbitrary extra keys via index signature. */
export interface CardMeta {
  // News / Link fields
  ogImage?: string;
  imageUrl?: string;
  url?: string;
  ogTitle?: string;
  ogDescription?: string;
  source?: string;
  publishedAt?: string;
  previewImage?: string;

  // File fields (both snake_case from backend and camelCase)
  file_id?: string;
  fileId?: string;
  filename?: string;
  file_size?: number;
  fileSize?: number;
  mime_type?: string;
  mimeType?: string;
  file_type?: string;
  fileType?: string;
  uploading?: boolean;
  uploaded_at?: string;

  // Ticker / Chart fields
  security_id?: number;
  tickerSymbol?: string;
  tickerName?: string;
  chartPeriod?: string;
  price?: number;
  currency?: string;
  sparkline?: unknown[];
  lastUpdate?: string;
  priceChange?: number;

  // TxChart widget fields
  pitch?: string;
  chartState?: unknown;
  aiInstruments?: unknown[];
  detectedPatterns?: unknown[];

  // Fundamental / Technical
  metrics?: Record<string, unknown>;
  fundamentalData?: Record<string, unknown>;
  indicators?: Record<string, unknown>;
  technicalData?: Record<string, unknown>;

  // Layout (legacy, prefer Card.width/height)
  layout?: { width?: number; height?: number };

  // Signal
  sourceType?: string;

  // Widget
  widgetType?: WidgetType;
  screenerFilters?: import('@/features/board/components/cardContent/AiScreenerContent').AiScreenerFilters;
  screenerResults?: import('@/services/api/tickers').ScreenerResult[] | null;
  newsFilters?: string[];
  newsTickers?: string[];

  // Strategy / Trading Ideas
  strategyId?: number;
  deploymentId?: number;

  // Port system overrides (for widget / strategy cards)
  ports?: {
    extraInputs?: import('@/features/board/ports/types').PortDefinition[];
    extraOutputs?: import('@/features/board/ports/types').PortDefinition[];
    removedPortIds?: string[];
  };

  // Allow additional dynamic fields
  [key: string]: unknown;
}

// ========== CARD ==========
export interface Card {
  // Card positioning
  id: number;
  boardId: number;
  userId: string;
  cardDataId: number;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
  color?: string;

  // Card data (embedded)
  title: string;
  content: string;
  type: CardType;
  priority?: 'high' | 'medium' | 'low';
  tags?: Tag[];
  meta: CardMeta;

  // Signal-specific fields (populated for signal cards)
  signalWebhookId?: number;
  signals?: SignalItem[];
  signalsCount?: number;

  createdAt: string;
  updatedAt?: string;
}

// Received signal item (for display in signal cards)
export interface SignalItem {
  id: number;
  payload: Record<string, unknown>;
  createdAt: string;
  securityId?: number; // Опциональное поле
}

// Signal Meta structure (when type='signal')
// Note: Signals are now loaded dynamically via card.signals, not stored in meta
// Only source_type is stored for displaying instructions when no signals received yet
export interface SignalMeta {
  sourceType?: 'tradingview' | 'telegram';
}

// Board with all cards response
export interface BoardFullData {
  board: Board;
  cards: Card[];
}

export interface CreateCardRequest {
  boardId: number;
  title: string;
  content: string;
  type: CardType;
  priority?: 'high' | 'medium' | 'low';
  tags?: Tag[];
  meta?: Record<string, unknown>;
  // Position fields (required for card placement)
  x: number;
  y: number;
  zIndex?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface UpdateCardRequest {
  title?: string;
  content?: string;
  type?: CardType;
  priority?: 'high' | 'medium' | 'low';
  tags?: Tag[];
  meta?: Record<string, unknown>;
  // Position updates
  x?: number;
  y?: number;
  zIndex?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface BatchUpdateCardPositionsRequest {
  positions: Array<{
    cardId: number;
    x: number;
    y: number;
    zIndex: number;
  }>;
}

// ========== EDGE TYPES ==========
export interface Edge {
  id: number;
  sourceCardId: number;
  targetCardId: number;
  edgeType: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEdgeRequest {
  sourceCardId: number;
  targetCardId: number;
  edgeType: string;
  meta?: Record<string, unknown>;
}

export interface UpdateEdgeRequest {
  sourceCardId?: number;
  targetCardId?: number;
  edgeType?: string;
}

export interface EdgeListResponse {
  edges: Edge[];
  total: number;
}

// ========== FILE TYPES (S3-based) ==========
export interface FileUploadResponse {
  fileId: string; // UUID from backend
  filename: string;
  fileSize: number;
  mimeType: string;
  title: string;
  s3Key: string;
}

export interface FileInfoResponse {
  fileId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string; // Pre-signed S3 URL (1 hour expiration)
  title: string;
}

// File card meta structure
export interface FileCardMeta {
  fileId: string;
  s3Key: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  fileType?: string; // File extension (without dot)
  uploading?: boolean; // Flag during upload process
  uploaded_at?: string; // ISO date string when file was uploaded
}

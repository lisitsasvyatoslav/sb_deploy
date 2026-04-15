// Chat and messaging types

import type { WidgetType } from '@/features/chat/types/widget';

export type MessageRole = 'user' | 'assistant' | 'tool';
export type MessageType =
  | 'chat'
  | 'survey_qa'
  | 'welcome_ack'
  | 'survey_feedback'
  /** User strategy-survey chip answers: one bubble per line (local/mock; fits DB varchar(20)) */
  | 'survey_rows'
  /** Marker message rendered as strategy recommendation cards in the chat */
  | 'strategy_results';

export type ChatType = 'chat' | 'pipeline';

// ========== CHAT ==========
export interface Chat {
  id: number;
  userId: string;
  name: string;
  systemPromptId: string;
  type?: ChatType;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatListItem {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string | null;
  messageCount: number;
  systemPromptId: string;
  type?: ChatType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRequest {
  name?: string;
  systemPromptId?: string;
  type?: ChatType;
  seedMessages?: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface UpdateChatRequest {
  name?: string;
  systemPromptId?: string;
}

// ========== TOOL CALLS ==========
export interface ToolCallInfo {
  type: string; // Tool name (e.g., "get_boards", "get_positions")
  status: 'pending' | 'done' | 'error'; // Tool execution status
  content: string; // Human-readable description
}

// ========== PLAN ==========
export interface Plan {
  id: number;
  status: string;
  description: string | null;
  duration: number;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  error?: string | null;
  executionSteps?: ExecutionStep[];
}

// ========== EXECUTION STEP (pipeline step log) ==========
export interface ExecutionStep {
  id: number;
  tool: string;
  description: string | null;
  status: string;
  duration: number;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  error?: string | null;
}

// ========== MESSAGE ==========
export interface Message {
  id: number;
  chatId: number;
  userId: string;
  role: MessageRole;
  content: string;
  messageType?: MessageType; // 'chat' (default), 'survey_qa', 'welcome_ack'
  tokenUsage?: number | null; // Local token calculation (user: text+attachments, assistant: output)
  cardIds?: number[] | null;
  fileIds?: string[] | null;
  tradeIds?: number[] | null;
  tickers?: Record<string, number | null> | null; // Ticker -> security_id mapping (from JOIN with ticker_screener_data)
  linkUrls?: string[] | null; // Link URLs attached to the message
  toolCalls?: ToolCallInfo[] | null; // Tool calls made during generation
  plans?: Plan[] | null; // Pipeline plans attached to this message
  widget?: WidgetType; // Widget type for welcome/demo messages
  widgetData?: Record<string, unknown>; // Widget data for rendering
  truncated?: boolean; // Whether this message is truncated (for sparkle chat limit)
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  content: string;
  role?: MessageRole;
  cardIds?: number[];
  fileIds?: string[];
  tradeIds?: number[];
}

export interface SendMessageRequest {
  content: string;
  cardIds?: number[];
  fileIds?: string[];
  tradeIds?: number[];
  linkUrls?: string[];
  boardId?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  settings?: { maxTokens?: number | null; temperature?: number | null };
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

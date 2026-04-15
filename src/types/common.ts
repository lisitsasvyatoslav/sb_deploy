// Common types and enums used across the application

// ========== ENUMS ==========
export type RiskLevel = 'low' | 'medium' | 'high';
export type Direction = 'long' | 'short';
export type LLMProvider =
  | 'openai'
  | 'perplexity'
  | 'deepseek'
  | 'qwen'
  | 'openrouter';
export type BoardType = 'kanban' | 'custom';
export type CardType =
  | 'note'
  | 'file'
  | 'news'
  | 'fundamental'
  | 'technical'
  | 'chart'
  | 'link'
  | 'ai_response'
  | 'signal'
  | 'widget'
  | 'strategy'
  | 'trading_idea';
export type PositionType = 'card' | 'ai_node';
export type PromptType =
  | 'market_analysis'
  | 'strategy_generation'
  | 'risk_assessment'
  | 'broker_analysis';
export type PromptStatus = 'draft' | 'active' | 'completed';
export type TradeDirection = 'long' | 'short';

// ========== UTILITY TYPES ==========
export type ID = number;
export type StringID = string;

// ========== LEGACY POSITION ==========
export interface Position {
  x: number;
  y: number;
}

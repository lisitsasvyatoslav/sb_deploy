/** Shared UI / Storybook — subset of former app-wide common types */

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

export interface BoardTicker {
  symbol: string;
  securityId?: number;
}

/**
 * Tag types and interfaces for card tags
 */

export type TagType =
  | 'ticker'
  | 'link'
  | 'ai-response'
  | 'signal'
  | 'keyword'
  | 'source'
  | 'entity'
  | 'sentiment';

export interface TagMeta {
  symbol?: string;
  security_id?: number; // Legacy snake_case (for backwards compatibility)
  securityId?: number; // New camelCase (preferred)
  entityType?: string;
  label?: string;
  url?: string;
  link?: string;
  [key: string]: unknown;
}

export interface Tag {
  id?: number; // ID is present in responses from backend, but omitted in creation requests
  type: TagType;
  text: string;
  icon?: string | null;
  meta?: TagMeta;
  order: number;
}

// Type guards
export const isTickerTag = (tag: Tag): boolean => tag.type === 'ticker';
export const isLinkTag = (tag: Tag): boolean => tag.type === 'link';
export const isAiResponseTag = (tag: Tag): boolean =>
  tag.type === 'ai-response';
export const isSignalTag = (tag: Tag): boolean => tag.type === 'signal';

export const isKeywordTag = (tag: Tag): boolean => tag.type === 'keyword';
export const isEntityTag = (tag: Tag): boolean => tag.type === 'entity';
export const isSentimentTag = (tag: Tag): boolean => tag.type === 'sentiment';

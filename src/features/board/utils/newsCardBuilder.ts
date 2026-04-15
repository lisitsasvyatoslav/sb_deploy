import type { CreateCardRequest } from '@/types';
import { buildTagsFromNews } from './newsTagMapper';

export interface NewsItemForCard {
  id: string;
  title?: string;
  content?: string;
  fullContent?: string;
  summary?: string;
  sourceName?: string;
  source?: string;
  sourceUrl?: string;
  timestamp?: string;
  metadata?: { preprocessing?: { results?: unknown } };
  stocks?: Array<{ symbol: string }>;
}

/**
 * Builds a CreateCardRequest from a news feed item.
 * Used in NewsSidebar, MainPage, and any other context where feed news is saved to a board.
 */
export function buildNewsCardRequest(
  news: NewsItemForCard,
  boardId: number,
  position: { x: number; y: number } = { x: 0, y: 0 }
): CreateCardRequest {
  const content = news.fullContent || news.content || news.summary || '';
  const tags = buildTagsFromNews(news);

  return {
    boardId,
    title: news.title || 'Untitled News',
    content,
    type: 'news',
    x: position.x,
    y: position.y,
    zIndex: 1,
    tags,
    meta: {
      source: news.sourceName || news.source,
      timestamp: news.timestamp,
      url: news.sourceUrl,
      newsId: news.id,
      ai_data: news.metadata?.preprocessing?.results || null,
    },
  };
}

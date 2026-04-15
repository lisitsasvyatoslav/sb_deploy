import { Tag } from '@/types';

// Helper to safely access nested properties on loosely-typed external news data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NewsRecord = Record<string, any>; // External news API has deeply-nested dynamic structure with no typedefs

/**
 * Собирает теги для карточки новости из данных AI-аннотаций
 */
export const buildTagsFromNews = (news: NewsRecord): Tag[] => {
  const tags: Tag[] = [];
  let order = 0;

  // Добавляем тикеры/акции
  const stocks = news?.stocks || news?.tickers;
  if (Array.isArray(stocks)) {
    stocks.forEach((stock: NewsRecord, index: number) => {
      if (!stock?.symbol) return;
      tags.push({
        type: 'ticker',
        text: `${stock.symbol}${stock.change ? ` ${stock.change}` : ''}`.trim(),
        icon: null,
        meta: {
          symbol: stock.symbol,
          change: stock.change,
          name: stock.name,
          securityId: stock.securityId,
        },
        order: index,
      });
      order = index + 1;
    });
  }

  // Проверяем наличие AI-обработки (может быть в разных местах)
  const hasAiProcessing =
    news?.metadata?.ai_processed ||
    news?.metadata?.preprocessing?.completedJobs > 0 ||
    news?.ai_processed ||
    news?.preprocessing?.ai_annotation; // для filter/search

  if (!hasAiProcessing) {
    return tags;
  }

  // Извлекаем AI-данные - поддерживаем разные структуры для trending/filter/search
  const aiAnnotation =
    news?.preprocessing?.ai_annotation?.annotations || // filter/search feed (ПРАВИЛЬНЫЙ ПУТЬ!)
    news?.metadata?.preprocessing?.results?.ai_annotation?.annotations || // trending feed
    {};

  const contentEnhancement =
    news?.preprocessing?.results?.content_enhancement ||
    news?.metadata?.preprocessing?.results?.content_enhancement;

  // Categories (добавляем первыми после тикеров)
  const categories = aiAnnotation?.categories || [];
  if (Array.isArray(categories)) {
    categories.forEach((category: unknown) => {
      if (!category) return;
      tags.push({
        type: 'keyword',
        text: String(category),
        meta: { source: 'ai_processing', isCategory: true },
        order: order++,
      });
    });
  }

  // Keywords
  const keywords = aiAnnotation?.keywords || [];
  if (Array.isArray(keywords)) {
    keywords.forEach((kw: unknown) => {
      if (!kw) return;
      tags.push({
        type: 'keyword',
        text: String(kw),
        meta: { source: 'ai_processing' },
        order: order++,
      });
    });
  }

  // Entities (маппим в keyword, т.к. entity не поддерживается бэкендом)
  const entities = aiAnnotation?.entities || [];
  if (Array.isArray(entities)) {
    entities.forEach((entity: NewsRecord) => {
      const text = entity?.name || entity?.text || entity?.value;
      if (!text) return;
      tags.push({
        type: 'keyword',
        text: String(text),
        meta: {
          entityType: entity?.type || entity?.category,
          confidence: entity?.confidence,
          originalType: 'entity',
        },
        order: order++,
      });
    });
  }

  // Sentiment (маппим в keyword, т.к. sentiment не поддерживается бэкендом)
  const sentiment = contentEnhancement?.sentiment || aiAnnotation?.sentiment;
  if (sentiment?.label) {
    tags.push({
      type: 'keyword',
      text: String(sentiment.label),
      meta: {
        label: sentiment.label,
        score: sentiment.score,
        summary: sentiment.summary,
        originalType: 'sentiment',
      },
      order: order++,
    });
  }

  return tags;
};

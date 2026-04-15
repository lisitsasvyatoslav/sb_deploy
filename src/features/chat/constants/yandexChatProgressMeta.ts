/**
 * Keys on SSE `tool_progress` meta (set by nestjs AgentService) for Yandex Metrika wiring.
 */
export const YM_CHAT_TOOL_PROGRESS_META = {
  CHAT_NEWS_SUMMARY: 'chat_news_summary',
  NEWS_FEED_WIDGET_CREATED: 'news_feed_widget_created',
  BOARD_ID: 'board_id',
} as const;

import type { CardMeta, WidgetType } from '@/types';
import React from 'react';
import { AiScreenerContent } from './AiScreenerContent';
import TickerCardContent from './TickerCardContent';
import { PositionsTableWidget } from './widgets/PositionsTableWidget';
import { NewsFeedWidget } from './widgets/NewsFeedWidget';
import { WidgetPlaceholderWidget } from './widgets/WidgetPlaceholderWidget';
import { PortfolioChartWidget } from './widgets/PortfolioChart';

interface WidgetContentProps {
  widgetType?: WidgetType;
  cardId: number;
  boardId?: number;
  meta?: CardMeta;
}

export const WidgetContent: React.FC<WidgetContentProps> = ({
  widgetType,
  cardId,
  boardId,
  meta,
}) => {
  if (!widgetType) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm">
        Widget
      </div>
    );
  }

  switch (widgetType) {
    case 'ai_screener':
      return (
        <AiScreenerContent
          cardId={cardId}
          widgetType={widgetType}
          screenerFilters={meta?.screenerFilters}
          screenerResults={meta?.screenerResults}
        />
      );
    case 'ticker_card':
      return (
        <TickerCardContent
          securityId={meta?.security_id}
          symbol={meta?.tickerSymbol}
          tickerName={meta?.tickerName}
        />
      );
    case 'positions_table':
      return <PositionsTableWidget />;
    case 'portfolio_chart':
      return <PortfolioChartWidget />;
    case 'news_feed':
      return <NewsFeedWidget cardId={cardId} boardId={boardId} meta={meta} />;
    case 'screener_forecast':
      return (
        <AiScreenerContent
          cardId={cardId}
          widgetType={widgetType}
          screenerFilters={meta?.screenerFilters}
          screenerResults={meta?.screenerResults}
        />
      );
    case 'ticker_adder':
    case 'ticker_graph':
    case 'strategy_output_ideas':
    case 'strategy_checklist':
      return <WidgetPlaceholderWidget />;
    default:
      return <WidgetPlaceholderWidget />;
  }
};

export default WidgetContent;

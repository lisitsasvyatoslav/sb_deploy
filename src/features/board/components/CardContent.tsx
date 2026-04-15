import { Card, CardMeta, CardType } from '@/types';
import React, { lazy, Suspense } from 'react';
import { AiAnswerContent } from './cardContent/AiAnswerContent';
import { FileContent } from './cardContent/FileContent';
import { FundamentalContent } from './cardContent/FundamentalContent';
import { LinkContent } from './cardContent/LinkContent';
import { NewsContent } from './cardContent/NewsContent';
import { SignalContent } from './cardContent/SignalContent';
import { StrategyContent } from './cardContent/StrategyContent';
import { TechnicalContent } from './cardContent/TechnicalContent';
import { TradingIdeaContent } from './cardContent/TradingIdeaContent';
import { TextContent } from './cardContent/TextContent';
import { WidgetContent } from './cardContent/WidgetContent';

const ChartWidgetContent = lazy(
  () => import('./cardContent/ChartWidgetContent')
);

/**
 * CardContent component - Unified card content display based on card type
 *
 * Uses Figma design reference:
 * https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
 */

interface CardContentProps {
  card: Card;
}

// CardMeta has an index signature so it can't be directly assigned to narrow component prop types.
// We cast through unknown to satisfy TypeScript while keeping runtime safety.
const narrow = <T,>(meta: CardMeta): T => meta as unknown as T;

export const CardContent: React.FC<CardContentProps> = ({ card }) => {
  // Map card types to content components
  const meta = card.meta;
  const byType: Record<CardType, React.ReactNode> = {
    news: <NewsContent content={card.content} />,
    note: <TextContent content={card.content} />,
    file: <FileContent fileType={meta?.file_type} meta={narrow(meta)} />,
    chart: (
      <Suspense fallback={null}>
        <ChartWidgetContent card={card} />
      </Suspense>
    ),
    link: <LinkContent meta={narrow(meta)} />,
    fundamental: <FundamentalContent meta={narrow(meta)} />,
    technical: <TechnicalContent meta={narrow(meta)} />,
    ai_response: <AiAnswerContent content={card.content} />,
    signal: (
      <SignalContent
        meta={narrow(meta)}
        signalWebhookId={card.signalWebhookId}
        signals={card.signals}
      />
    ),
    widget: (
      <WidgetContent
        widgetType={meta?.widgetType}
        cardId={card.id}
        boardId={card.boardId}
        meta={meta}
      />
    ),
    strategy: (
      <StrategyContent
        cardId={card.id}
        strategyId={meta?.strategyId}
        title={card.title}
        labelColor={card.color}
        createdAt={card.createdAt}
      />
    ),
    trading_idea: <TradingIdeaContent strategyId={meta?.strategyId} />,
  };

  // Get content component for card type, fallback to note
  const contentComponent = byType[card.type] || byType.note;

  return <>{contentComponent}</>;
};

export default CardContent;

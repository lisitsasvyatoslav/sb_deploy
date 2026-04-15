import type { Card } from '@/types';
import { ChartModalContent } from './ChartModalContent';
import { NoteModalContent } from './NoteModalContent';
import { FundamentalModalContent } from './FundamentalModalContent';
import { TechnicalModalContent } from './TechnicalModalContent';
import { NewsModalContent } from './NewsModalContent';
import { FileModalContent } from './FileModalContent';
import { SignalModalContent } from './SignalModalContent';

interface CardModalContentProps {
  card: Card;
  boardId: number;
  onAskAI?: () => void;
  onAskAIWithFile?: (
    fileId: string,
    filename: string,
    mimeType?: string
  ) => void;
}

export function CardModalContent({
  card,
  boardId,
  onAskAI,
  onAskAIWithFile,
}: CardModalContentProps) {
  switch (card.type) {
    case 'chart':
      return <ChartModalContent card={card} boardId={boardId} />;
    case 'note':
    case 'ai_response':
      return (
        <NoteModalContent
          card={card}
          boardId={boardId}
          onAskAI={onAskAI}
          onAskAIWithFile={onAskAIWithFile}
        />
      );
    case 'fundamental':
      return <FundamentalModalContent card={card} />;
    case 'technical':
      return <TechnicalModalContent card={card} />;
    case 'news':
      return <NewsModalContent card={card} />;
    case 'file':
      return <FileModalContent card={card} />;
    case 'signal':
      return <SignalModalContent card={card} boardId={boardId} />;
    default:
      return null;
  }
}

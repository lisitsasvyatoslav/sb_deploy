import React, { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import ChatSuggestion from './ChatSuggestion';

interface ChatSuggestionsListProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatSuggestionsList: React.FC<ChatSuggestionsListProps> = ({
  onSend,
  disabled = false,
}) => {
  const { t } = useTranslation('chat');

  const suggestions = useMemo(
    () => [
      t('suggestions.moexMarket'),
      t('suggestions.portfolioDiversified'),
      t('suggestions.analyzeTrading'),
      t('suggestions.monthlyEarnings'),
      t('suggestions.whatCanYouDo'),
    ],
    [t]
  );

  return (
    <div className="flex flex-col w-full bg-background-card px-12">
      {suggestions.map((suggestion) => (
        <ChatSuggestion
          key={suggestion}
          text={suggestion}
          onSend={onSend}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default ChatSuggestionsList;

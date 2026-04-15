import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import ChatSuggestionsList from './ChatSuggestionsList';
import Disclaimer from './Disclaimer';

interface EmptyChatProps {
  onSendSuggestion: (text: string) => void;
  disabled?: boolean;
  chatType?: string;
}

const EmptyChat: React.FC<EmptyChatProps> = ({
  onSendSuggestion,
  disabled = false,
  chatType,
}) => {
  const { t } = useTranslation('chat');
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center gap-6">
        {chatType === 'pipeline' ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center">
              <svg
                className="w-8 h-8 theme-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium theme-text-primary mb-2">
              {t('pipeline.title')}
            </h3>
            <p className="text-sm theme-text-secondary max-w-[240px]">
              {t('pipeline.description')}
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-16 font-semibold text-text-primary text-center leading-tight">
              {t('empty.heading')}
            </h2>

            {/* Suggestions List */}
            <ChatSuggestionsList
              onSend={onSendSuggestion}
              disabled={disabled}
            />
          </>
        )}

        {/* Disclaimer */}
        <Disclaimer variant="full" className="mt-2" />
      </div>
    </div>
  );
};

export default React.memo(EmptyChat);

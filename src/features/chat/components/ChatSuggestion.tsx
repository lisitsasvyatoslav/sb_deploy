import React from 'react';
import { Icon } from '@/shared/ui/Icon';

interface ChatSuggestionProps {
  text: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatSuggestion: React.FC<ChatSuggestionProps> = ({
  text,
  onSend,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onSend(text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between
        px-4 py-4
        hover:bg-background-hover
        border-b border-border-light
        last:border-b-0
        last:mb-2
        first:mt-2
        transition-colors duration-200
        text-left
        min-h-[48px]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="text-14 text-text-primary font-normal">{text}</span>
      <Icon
        variant="chevronRight"
        size={20}
        className="text-text-secondary flex-shrink-0 ml-2"
      />
    </button>
  );
};

export default ChatSuggestion;

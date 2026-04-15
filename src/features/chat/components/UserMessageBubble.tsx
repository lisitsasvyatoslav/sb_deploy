import React, { useRef, useEffect } from 'react';
import type { MessageType } from '@/types';

interface UserMessageBubbleProps {
  /** Message content */
  content: string;
  /** When `survey_rows`, render each line as its own bubble (strategy survey chip picks only). */
  messageType?: MessageType;
  /** Whether the message is in edit mode */
  isEditing?: boolean;
  /** Callback when content changes during editing */
  onContentChange?: (newContent: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({
  content,
  messageType,
  isEditing = false,
  onContentChange,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea and focus when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange?.(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const rowLines =
    messageType === 'survey_rows' && !isEditing && content.includes('\n')
      ? content.split('\n')
      : null;

  if (rowLines && rowLines.length > 1) {
    return (
      <div className={`flex flex-col gap-[4px] items-end ${className}`}>
        {rowLines.map((line, i) => (
          <div
            key={i}
            className="
              rounded-[4px] px-3 py-2
              bg-chat-bubble
              w-fit min-w-[250px] max-w-[391px]
              text-chat-bubble-text
            "
          >
            <p className="text-chat-bubble-text text-14 leading-relaxed font-medium break-words min-h-[1.25em]">
              {line.length > 0 ? line : '\u00A0'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-[4px] px-3 py-2
        bg-chat-bubble
        w-fit min-w-[250px] max-w-[391px]
        text-chat-bubble-text
        ${className}
      `}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          className="
            w-full min-h-[24px] resize-none
            bg-transparent border-none outline-none
            text-14 leading-relaxed
            font-medium
            text-chat-bubble-text
            placeholder:text-text-muted
          "
          rows={1}
        />
      ) : (
        <p className="text-chat-bubble-text text-14 leading-relaxed font-medium whitespace-pre-wrap break-words">
          {content}
        </p>
      )}
    </div>
  );
};

export default UserMessageBubble;

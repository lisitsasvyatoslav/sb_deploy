import React from 'react';
import { cn } from '@/shared/utils/cn';
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import MessageActionsPanel from './MessageActionsPanel';

interface MessageBlockProps {
  /** AI response content in markdown */
  content: string;
  /** Callback when refresh/regenerate button is clicked */
  onRefresh?: () => void;
  /** Callback when copy button is clicked */
  onCopy?: () => void;
  /** Callback when "Add to board" button is clicked */
  onAddToBoard?: () => void;
  /** Label for "Add to board" button */
  addToBoardLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MessageBlock — Message block + Actions message panel/Web
 *
 * Full AI response block: markdown rendered text + action panel.
 *
 * Figma node: from 2995:100881 (Portfolio page)
 */
const MessageBlock: React.FC<MessageBlockProps> = ({
  content,
  onRefresh,
  onCopy,
  onAddToBoard,
  addToBoardLabel,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col items-stretch w-full', className)}>
      {/* AI response markdown */}
      <div className="pb-2">
        <MarkdownRenderer
          content={content}
          className="text-14 leading-5 text-blackinverse-a100"
        />
      </div>

      {/* Actions panel */}
      <MessageActionsPanel
        onRefresh={onRefresh}
        onCopy={onCopy}
        onAddToBoard={onAddToBoard}
        addToBoardLabel={addToBoardLabel}
      />
    </div>
  );
};

export default MessageBlock;

import React from 'react';
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import LlmResponseActionBar from './LlmResponseActionBar';

type FeedbackType = 'good' | 'bad' | null;

interface LlmResponseMessageProps {
  /** The markdown content to display */
  content: string;
  /** Whether content is truncated */
  truncated?: boolean;
  /** Current user feedback */
  feedback?: FeedbackType;
  /** Number of sources/attachments used */
  sourcesCount?: number;
  /** Callback when thumbs up is clicked */
  onThumbsUp?: () => void;
  /** Callback when thumbs down is clicked */
  onThumbsDown?: () => void;
  /** Callback when sources indicator is clicked */
  onSourcesClick?: () => void;
  /** Callback when copy is clicked */
  onCopy?: () => void;
  /** Callback when refresh/regenerate is clicked */
  onRefresh?: () => void;
  /** Callback when add to board is clicked */
  onAddToBoard?: () => void;
  /** Whether to show action bar */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LLM Response Message component.
 * Displays AI response with markdown formatting and action bar.
 *
 * Based on Figma design: 40003106-102483
 *
 * Layout:
 * - Message text: 14px, line-height 20px, letter-spacing -0.2px
 * - Padding bottom 8px before action bar
 * - Action bar: height 32px
 */
const LlmResponseMessage: React.FC<LlmResponseMessageProps> = ({
  content,
  truncated = false,
  feedback,
  sourcesCount = 0,
  onThumbsUp,
  onThumbsDown,
  onSourcesClick,
  onCopy,
  onRefresh,
  onAddToBoard,
  showActions = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Message content with markdown - 14px, line-height 20px, letter-spacing -0.2px */}
      <div
        className={`pb-[8px] text-[14px] leading-[20px] tracking-[-0.2px] break-words overflow-hidden ${truncated ? 'text-text-secondary' : 'text-text-primary'}`}
      >
        <MarkdownRenderer content={content} />
      </div>

      {/* Action bar */}
      {showActions && (
        <LlmResponseActionBar
          feedback={feedback}
          sourcesCount={sourcesCount}
          onThumbsUp={onThumbsUp}
          onThumbsDown={onThumbsDown}
          onSourcesClick={onSourcesClick}
          onCopy={onCopy}
          onRefresh={onRefresh}
          onAddToBoard={onAddToBoard}
        />
      )}
    </div>
  );
};

export default LlmResponseMessage;

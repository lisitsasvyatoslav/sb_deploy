import Image from 'next/image';
import React, { useCallback } from 'react';
import Tooltip from '@/shared/ui/Tooltip';
import { useCopiedState } from '@/shared/hooks/useCopiedState';
import { useTranslation } from '@/shared/i18n/client';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';

type FeedbackType = 'good' | 'bad' | null;

interface LlmResponseActionBarProps {
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
  /** Disable all interactive buttons */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const LlmResponseActionBar: React.FC<LlmResponseActionBarProps> = ({
  feedback,
  sourcesCount = 0,
  onThumbsUp,
  onThumbsDown,
  onSourcesClick,
  onCopy,
  onRefresh,
  onAddToBoard,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation('chat');
  const [isCopied, markCopied] = useCopiedState(2000);
  const saveToBoardGlow = useGlowTarget('save-to-board');

  const handleCopyClick = useCallback(() => {
    onCopy?.();
    markCopied();
  }, [onCopy, markCopied]);

  return (
    <div
      className={`flex items-center justify-between h-[32px] w-full rounded-[4px] ${className}`}
    >
      {/* Left side: Rating buttons + Sources indicator */}
      <div className="flex items-center h-full">
        {/* Thumb down & up buttons — temporarily hidden */}
        {false && (
          <>
            <button
              type="button"
              onClick={onThumbsDown}
              disabled={disabled}
              className={`
            flex items-center justify-center p-[8px] rounded-[8px]
            transition-opacity duration-150
            hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none
            ${feedback === 'bad' ? 'opacity-100' : 'opacity-60'}
          `}
              aria-label="Rate as bad"
            >
              <Image
                src="/images/thumb-down.svg"
                alt=""
                width={16}
                height={16}
                className="w-[16px] h-[16px] invert dark:invert-0"
              />
            </button>

            <button
              type="button"
              onClick={onThumbsUp}
              disabled={disabled}
              className={`
            flex items-center justify-center p-[8px] rounded-[8px]
            transition-opacity duration-150
            hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none
            ${feedback === 'good' ? 'opacity-100' : 'opacity-60'}
          `}
              aria-label="Rate as good"
            >
              <Image
                src="/images/thumb-down.svg"
                alt=""
                width={16}
                height={16}
                className="w-[16px] h-[16px] -scale-y-100 invert dark:invert-0"
              />
            </button>
          </>
        )}

        {/* Sources indicator */}
        {sourcesCount > 0 && (
          <button
            type="button"
            onClick={onSourcesClick}
            className="flex items-center gap-[2px] h-[32px] pl-[8px] pr-[10px] rounded-[2px] transition-opacity duration-150 hover:opacity-80"
          >
            <Image
              src="/images/ai-attach.svg"
              alt=""
              width={16}
              height={16}
              className="w-[16px] h-[16px] invert dark:invert-0"
            />
            <span className="text-[12px] font-medium leading-[16px] tracking-[-0.2px] text-text-secondary">
              {t('sources', { count: sourcesCount })}
            </span>
          </button>
        )}
      </div>

      {/* Right side: Copy, Refresh, Add to board */}
      <div className="flex items-center h-full">
        {/* Copy button - 20x20 icon, 8px padding */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCopyClick}
            disabled={disabled}
            className={`flex items-center justify-center p-[8px] rounded-[2px] transition-opacity duration-150 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none ${isCopied ? 'opacity-70' : ''}`}
            aria-label="Copy response"
          >
            <Image
              src={isCopied ? '/images/copy-bold.svg' : '/images/copy.svg'}
              alt=""
              width={20}
              height={20}
              className="w-[20px] h-[20px] invert dark:invert-0"
            />
          </button>
          <Tooltip
            content={t('copied')}
            show={isCopied}
            position="top"
            delay={0}
          />
        </div>

        {/* Refresh/Regenerate button — temporarily hidden */}
        {false && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={disabled}
            className="flex items-center justify-center p-[8px] rounded-[2px] transition-opacity duration-150 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
            aria-label="Regenerate response"
          >
            <Image
              src="/images/refresh.svg"
              alt=""
              width={20}
              height={20}
              className="w-[20px] h-[20px] invert dark:invert-0"
            />
          </button>
        )}

        {/* Add to board button - 14px text, 16x16 icon, gap-4px, px-8px py-6px */}
        <GlowBorder active={saveToBoardGlow} borderRadius={4} borderWidth={3}>
          <button
            type="button"
            onClick={onAddToBoard}
            disabled={disabled}
            className="flex items-center gap-[4px] h-[32px] px-[8px] py-[6px] rounded-[4px] transition-opacity duration-150 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
            aria-label={t('addToBoard')}
          >
            <span className="text-[14px] font-normal leading-[20px] tracking-[-0.2px] text-text-secondary">
              {t('addToBoard')}
            </span>
            <Image
              src="/images/screen-plus.svg"
              alt=""
              width={16}
              height={16}
              className="w-[16px] h-[16px] dark:invert opacity-60"
            />
          </button>
        </GlowBorder>
      </div>
    </div>
  );
};

export default LlmResponseActionBar;

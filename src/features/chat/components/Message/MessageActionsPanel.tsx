import React, { useCallback } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';
import Button from '@/shared/ui/Button';
import Tooltip from '@/shared/ui/Tooltip';
import { useCopiedState } from '@/shared/hooks/useCopiedState';
import { useTranslation } from '@/shared/i18n/client';

interface MessageActionsPanelProps {
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
 * MessageActionsPanel — Message actions panel
 *
 * Action panel below AI response message.
 * Right side: refresh + copy + "Add to board" ghost button.
 *
 * Figma node: from 2995:100881 (Portfolio page)
 */
const MessageActionsPanel: React.FC<MessageActionsPanelProps> = ({
  onRefresh,
  onCopy,
  onAddToBoard,
  addToBoardLabel = 'Добавить на доску',
  className = '',
}) => {
  const { t } = useTranslation('chat');
  const [isCopied, markCopied] = useCopiedState(2000);

  const handleCopyClick = useCallback(() => {
    onCopy?.();
    markCopied();
  }, [onCopy, markCopied]);

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-radius-4',
        className
      )}
    >
      {/* Left: empty in default state */}
      <div />

      {/* Right: action buttons */}
      <div className="flex items-center gap-1">
        {onRefresh && (
          <IconButton
            icon={<Icon variant="refresh" size={16} />}
            size={16}
            onClick={onRefresh}
            ariaLabel="Regenerate response"
          />
        )}

        {onCopy && (
          <div className="relative">
            <IconButton
              icon={<Icon variant={isCopied ? 'copyBold' : 'copy'} size={16} />}
              size={16}
              onClick={handleCopyClick}
              ariaLabel="Copy response"
              className={isCopied ? 'opacity-70' : undefined}
            />
            <Tooltip
              content={t('copied')}
              show={isCopied}
              position="top"
              delay={0}
            />
          </div>
        )}

        {onAddToBoard && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon variant="addBoard" size={16} />}
            onClick={onAddToBoard}
          >
            {addToBoardLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageActionsPanel;

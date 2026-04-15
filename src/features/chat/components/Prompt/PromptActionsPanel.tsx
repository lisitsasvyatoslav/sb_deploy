import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';
import ChipLink, {
  ChipLinkType,
} from '@/features/chat/components/Attachments/ChipLink';

export type PromptPanelState = 'default' | 'editing' | 'saved';

interface SourceChip {
  type: ChipLinkType;
  label: string;
  customIcon?: React.ReactNode;
}

interface PromptActionsPanelProps {
  /** Source chips to display on the left (e.g., ticker chips) */
  sources?: SourceChip[];
  /** Number of AI sources found */
  sourcesCount?: number;
  /** Current panel state */
  state?: PromptPanelState;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Callback when cancel (close) button is clicked in editing state */
  onCancel?: () => void;
  /** Callback when confirm (tick) button is clicked in editing state */
  onConfirm?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PromptActionsPanel — Prompt actions panel
 *
 * Action panel below user prompt. Left: source chips. Right: sources badge + action buttons.
 * States: default (edit button), editing (cancel + confirm), saved.
 *
 * Figma node: 56218:6428
 */
const PromptActionsPanel: React.FC<PromptActionsPanelProps> = ({
  sources = [],
  sourcesCount,
  state = 'default',
  onEdit,
  onCancel,
  onConfirm,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-1 pl-6',
        className
      )}
    >
      {/* Left: source chips */}
      <div className="flex items-center gap-1 min-w-0">
        {sources.map((source, index) => (
          <ChipLink
            key={index}
            type={source.type}
            label={source.label}
            customIcon={source.customIcon}
          />
        ))}
      </div>

      {/* Right: sources badge + action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Sources badge */}
        {sourcesCount !== undefined && sourcesCount > 0 && (
          <div className="flex items-center gap-0.5 py-1 pl-1 pr-1.5 rounded-radius-2">
            <Icon variant="ai" size={16} className="text-blackinverse-a56" />
            <span className="text-12 leading-4 text-blackinverse-a56 whitespace-nowrap">
              {sourcesCount} источников
            </span>
          </div>
        )}

        {/* Action buttons by state */}
        {state === 'default' && onEdit && (
          <IconButton
            icon={<Icon variant="edit" size={16} />}
            size={16}
            onClick={onEdit}
            ariaLabel="Edit prompt"
          />
        )}

        {state === 'editing' && (
          <>
            {onCancel && (
              <IconButton
                icon={<Icon variant="close" size={16} />}
                size={16}
                onClick={onCancel}
                ariaLabel="Cancel editing"
              />
            )}
            {onConfirm && (
              <IconButton
                icon={<Icon variant="tick" size={16} />}
                size={16}
                onClick={onConfirm}
                ariaLabel="Confirm edit"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PromptActionsPanel;

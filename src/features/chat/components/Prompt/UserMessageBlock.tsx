import React from 'react';
import { cn } from '@/shared/utils/cn';
import PromptActionsPanel, { PromptPanelState } from './PromptActionsPanel';
import { ChipLinkType } from '@/features/chat/components/Attachments/ChipLink';

interface SourceChip {
  type: ChipLinkType;
  label: string;
  customIcon?: React.ReactNode;
}

interface UserMessageBlockProps {
  /** Prompt message text */
  text: string;
  /** Source chips for the actions panel */
  sources?: SourceChip[];
  /** Number of AI sources */
  sourcesCount?: number;
  /** Current state: default, editing, saved */
  state?: PromptPanelState;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Callback when cancel is clicked in editing state */
  onCancel?: () => void;
  /** Callback when confirm is clicked in editing state */
  onConfirm?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserMessageBlock — User message block
 *
 * Full user message block: message bubble + PromptActionsPanel.
 * In editing state, text color changes to brand purple.
 *
 * Figma node: 56218:6417
 */
const UserMessageBlock: React.FC<UserMessageBlockProps> = ({
  text,
  sources,
  sourcesCount,
  state = 'default',
  onEdit,
  onCancel,
  onConfirm,
  className = '',
}) => {
  const isEditing = state === 'editing';

  return (
    <div className={cn('flex flex-col items-stretch w-full', className)}>
      {/* Customer prompt bubble */}
      <div className="pl-6">
        <div className="bg-blackinverse-a4 rounded-radius-4 py-2 px-3">
          <p
            className={cn(
              'text-14 leading-5',
              isEditing ? 'text-brand-base' : 'text-blackinverse-a100'
            )}
          >
            {text}
          </p>
        </div>
      </div>

      {/* Actions panel */}
      <PromptActionsPanel
        sources={sources}
        sourcesCount={sourcesCount}
        state={state}
        onEdit={onEdit}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </div>
  );
};

export default UserMessageBlock;

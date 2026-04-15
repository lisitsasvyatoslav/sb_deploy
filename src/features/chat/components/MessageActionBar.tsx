import React from 'react';
import { ChipLink, ChipLinkType } from './Attachments';
import EditMessageToggle from './EditMessageToggle';

export interface AttachmentInfo {
  type: ChipLinkType;
  label: string;
  onClick?: () => void;
}

interface MessageActionBarProps {
  /** List of attachments to display as chips */
  attachments?: AttachmentInfo[];
  /** Whether edit mode is enabled */
  isEditing?: boolean;
  /** Callback when edit button is clicked */
  onEditClick?: () => void;
  /** Callback when accept edit is clicked */
  onAcceptEdit?: () => void;
  /** Callback when decline edit is clicked */
  onDeclineEdit?: () => void;
  /** Whether to show the edit toggle */
  showEditToggle?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const MessageActionBar: React.FC<MessageActionBarProps> = ({
  attachments = [],
  isEditing = false,
  onEditClick,
  onAcceptEdit,
  onDeclineEdit,
  showEditToggle = true,
  className = '',
}) => {
  const hasAttachments = attachments.length > 0;
  const hasContent = hasAttachments || showEditToggle;

  if (!hasContent) return null;

  return (
    <div
      className={`
        flex items-center justify-between gap-1 h-8 w-full
        ${className}
      `}
    >
      {/* Left side: Attachment chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {attachments.map((attachment, index) => (
          <ChipLink
            key={`${attachment.type}-${index}`}
            type={attachment.type}
            label={attachment.label}
            onClick={attachment.onClick}
          />
        ))}
      </div>

      {/* Right side: Sources indicator + Edit toggle */}
      <div className="flex items-center gap-3">
        {showEditToggle && onEditClick && onAcceptEdit && onDeclineEdit && (
          <EditMessageToggle
            isEditing={isEditing}
            onEditClick={onEditClick}
            onAccept={onAcceptEdit}
            onDecline={onDeclineEdit}
          />
        )}
      </div>
    </div>
  );
};

export default MessageActionBar;

import React from 'react';
import AttachmentListItem, {
  AttachmentListItemData,
} from './AttachmentListItem';
import { useTranslation } from '@/shared/i18n/client';

export type AttachmentListMode = 'input' | 'sent' | 'editing';

interface AttachmentListWindowProps {
  /** List of attachments to display */
  attachments: AttachmentListItemData[];
  /** Mode determines if delete is enabled */
  mode: AttachmentListMode;
  /** Callback when an attachment is deleted */
  onDelete?: (id: string | number) => void;
  /** Additional CSS classes */
  className?: string;
}

const AttachmentListWindow: React.FC<AttachmentListWindowProps> = ({
  attachments,
  mode,
  onDelete,
  className = '',
}) => {
  const { t } = useTranslation('chat');
  // Delete is only enabled in 'input' or 'editing' modes
  const canDelete = mode === 'input' || mode === 'editing';

  if (attachments.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <p className="text-14 text-text-secondary">
          {t('attachments.noAttachments')}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto scrollbar-chat ${className}`}>
      {attachments.map((attachment) => (
        <AttachmentListItem
          key={`${attachment.type}-${attachment.id}`}
          attachment={attachment}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AttachmentListWindow;

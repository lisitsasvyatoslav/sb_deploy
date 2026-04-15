import { useCallback, useState } from 'react';
import {
  AttachmentListMode,
  AttachmentListItemData,
  AttachmentType,
} from '@/features/chat/components/Attachments';

export function useChatAttachmentsManager() {
  const [showAttachmentsList, setShowAttachmentsList] = useState(false);
  const [attachmentsListContext, setAttachmentsListContext] = useState<{
    messageId?: number;
    mode: AttachmentListMode;
    attachments: AttachmentListItemData[];
    onDelete?: (id: string | number, type: AttachmentType) => void;
  } | null>(null);

  const handleOpenAttachmentsList = useCallback(
    (
      attachments: AttachmentListItemData[],
      mode: AttachmentListMode,
      onDelete?: (id: string | number, type: AttachmentType) => void,
      messageId?: number
    ) => {
      setAttachmentsListContext({ messageId, mode, attachments, onDelete });
      setShowAttachmentsList(true);
    },
    []
  );

  const handleCloseAttachmentsList = useCallback(() => {
    setShowAttachmentsList(false);
    setAttachmentsListContext(null);
  }, []);

  const handleDeleteAttachment = useCallback(
    (id: string | number) => {
      if (!attachmentsListContext) return;

      // Find the attachment to get its type
      const attachment = attachmentsListContext.attachments.find(
        (a) => a.id === id
      );
      if (!attachment) return;

      // Update local attachments list
      const updatedAttachments = attachmentsListContext.attachments.filter(
        (a) => a.id !== id
      );
      setAttachmentsListContext((prev) =>
        prev ? { ...prev, attachments: updatedAttachments } : null
      );

      // Call the provided deletion callback if available
      if (attachmentsListContext.onDelete) {
        attachmentsListContext.onDelete(id, attachment.type);
      }

      // If no attachments left, close the list
      if (updatedAttachments.length === 0) {
        handleCloseAttachmentsList();
      }
    },
    [attachmentsListContext, handleCloseAttachmentsList]
  );

  return {
    showAttachmentsList,
    attachmentsListContext,
    handleOpenAttachmentsList,
    handleCloseAttachmentsList,
    handleDeleteAttachment,
  };
}

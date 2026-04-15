import { useState, useCallback } from 'react';

/**
 * Manages message editing state: which message is being edited and its content.
 */
export function useMessageEditing(
  onEditMessage?: (messageId: number, newContent: string) => void
) {
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const handleStartEdit = useCallback((messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  }, []);

  const handleAcceptEdit = useCallback(
    (messageId: number) => {
      if (onEditMessage && editedContent.trim()) {
        onEditMessage(messageId, editedContent);
      }
      setEditingMessageId(null);
      setEditedContent('');
    },
    [onEditMessage, editedContent]
  );

  const handleDeclineEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditedContent('');
  }, []);

  return {
    editingMessageId,
    editedContent,
    setEditedContent,
    handleStartEdit,
    handleAcceptEdit,
    handleDeclineEdit,
  };
}

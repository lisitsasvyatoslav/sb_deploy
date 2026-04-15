'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { useTranslation } from '@/shared/i18n/client';
import { useModalEditor } from '@/shared/ui/Modal/useModalEditor';
import { EditorBubbleToolbar } from '@/shared/ui/Modal/EditorBubbleToolbar';
import { PlusButtonMenu } from '@/shared/ui/Modal/PlusButtonMenu';
import { useEditorFileUpload } from '@/shared/ui/Modal/extensions/useEditorFileUpload';
import { useUpdateCardMutation } from '@/features/board/queries';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { isValidUrl } from '@/shared/utils/ogExtractor';
import type { Card } from '@/types';

/** Extracts unique bare URLs (lines that are only a URL) from markdown content. */
function extractBareUrls(content: string): string[] {
  const seen = new Set<string>();
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => isValidUrl(line) && !seen.has(line) && seen.add(line))
    .slice(0, 3); // limit to 3 previews per note
}

const editorClassName =
  'h-full pt-2 px-6 prose prose-sm max-w-none text-[var(--text-primary)] [&_.tiptap]:outline-none [&_*]:!text-inherit [&_a]:!text-[var(--text-accent)] [&_a]:underline [&_a]:cursor-pointer [&_p]:mb-3';

interface NoteModalContentProps {
  card: Card;
  boardId: number;
  onAskAI?: () => void;
  onAskAIWithFile?: (
    fileId: string,
    filename: string,
    mimeType?: string
  ) => void;
}

export function NoteModalContent({
  card,
  boardId,
  onAskAI,
  onAskAIWithFile,
}: NoteModalContentProps) {
  const { t } = useTranslation('board');
  const updateCardMutation = useUpdateCardMutation();
  const mutationRef = useRef(updateCardMutation);
  mutationRef.current = updateCardMutation;

  const bareUrls = useMemo(
    () => extractBareUrls(card.content ?? ''),
    [card.content]
  );

  const contentRef = useRef(card.content ?? '');
  const isDirtyRef = useRef(false);

  const handleEditorChange = useCallback((md: string) => {
    contentRef.current = md;
    isDirtyRef.current = true;
  }, []);

  const editor = useModalEditor({
    content: card.content ?? '',
    placeholder: t('noteDialog.editorPlaceholder', 'Enter note text...'),

    onChange: handleEditorChange,
  });

  const { handleInsertFile, handleInsertImage } = useEditorFileUpload(
    editor,
    card.cardDataId
  );

  // Sync onAskAIWithFile callback into editor storage for FileAttachmentNodeView
  useEffect(() => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = (editor.storage as any)?.fileAttachment;
    if (storage) {
      storage.onAskAIWithFile = onAskAIWithFile ?? null;
    }
  }, [editor, onAskAIWithFile]);

  // Keep refs current for the unmount save
  const saveRef = useRef({ cardId: card.id, title: card.title, boardId });
  saveRef.current = { cardId: card.id, title: card.title, boardId };
  const tRef = useRef(t);
  tRef.current = t;

  // Auto-save on unmount (modal close)
  useEffect(() => {
    return () => {
      if (!isDirtyRef.current) return;
      const { cardId, title, boardId: bid } = saveRef.current;
      showSuccessToast(tRef.current('toast.cardUpdated'));
      mutationRef.current.mutate({
        id: cardId,
        data: { title, content: contentRef.current },
        boardId: bid,
      });
    };
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      {bareUrls.length > 0 && (
        <div className="px-6 pt-4 pb-0 flex flex-col gap-[8px]">
          {bareUrls.map((url) => (
            <LinkPreviewCard key={url} url={url} />
          ))}
        </div>
      )}
      {editor && (
        <>
          <EditorBubbleToolbar editor={editor} onAskAI={onAskAI} />
          <PlusButtonMenu
            editor={editor}
            onInsertFile={handleInsertFile}
            onInsertImage={handleInsertImage}
          />
          <EditorContent editor={editor} className={editorClassName} />
        </>
      )}
    </div>
  );
}

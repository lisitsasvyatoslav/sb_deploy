import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { useModalEditor } from './useModalEditor';
import type { EditorConfig } from './Modal.types';

interface ModalEditorContentProps {
  config: EditorConfig;
  onEditorReady: (editor: Editor | null) => void;
}

/**
 * Dynamically-loaded component that handles both tiptap editor creation
 * and rendering. Keeps all @tiptap imports out of the main modal bundle.
 */
export default function ModalEditorContent({
  config,
  onEditorReady,
}: ModalEditorContentProps) {
  const editor = useModalEditor(config);

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const timer = setTimeout(() => {
      if (!editor.isDestroyed) editor.commands.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <EditorContent
        editor={editor}
        className="h-full pt-2 pl-7 pr-6 prose prose-sm max-w-none text-[var(--text-primary)] [&_.tiptap]:outline-none [&_*]:!text-inherit [&_a]:!text-[var(--text-accent)] [&_a]:underline [&_a]:cursor-pointer [&_p]:mb-3"
      />
    </div>
  );
}

import { useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { useModalEditor } from './useModalEditor';
import type { EditorConfig } from './Modal.types';

/**
 * Conditionally rendered component that creates the TipTap editor.
 * Only mounted when editorConfig is provided, so non-editor modals
 * never pay the cost of instantiating ProseMirror.
 */
export function ModalEditorSetup({
  config,
  onEditorReady,
}: {
  config: EditorConfig;
  onEditorReady: (editor: Editor | null) => void;
}) {
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

  return null;
}

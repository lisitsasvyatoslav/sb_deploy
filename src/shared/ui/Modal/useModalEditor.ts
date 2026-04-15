import { useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { PlusButtonExtension } from './PlusButtonPlugin';
import { FileAttachmentExtension } from './extensions/FileAttachmentExtension';
import type { EditorConfig } from './Modal.types';

export function useModalEditor(config: EditorConfig) {
  const onChangeRef = useRef(config.onChange);
  onChangeRef.current = config.onChange;

  // Track the last externally-set content to avoid re-syncing the same value
  const lastExternalContentRef = useRef(config.content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: config.placeholder || '' }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: true,
        transformCopiedText: true,
      }),
      PlusButtonExtension,
      FileAttachmentExtension,
    ],
    content: config.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md: string = (editor.storage as any).markdown.getMarkdown();
      onChangeRef.current?.(md.trim() ? md : '');
    },
  });

  // Sync external content (edit mode: load card data)
  useEffect(() => {
    if (!editor || config.content == null) return;
    if (config.content === lastExternalContentRef.current) return;
    lastExternalContentRef.current = config.content;
    editor.commands.setContent(config.content);
  }, [editor, config.content]);

  return editor;
}

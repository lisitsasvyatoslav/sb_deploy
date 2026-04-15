'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Icon } from '@/shared/ui/Icon/Icon';
import { normalizeUrl } from '@/shared/utils/formatters';
import { useTranslation } from '@/shared/i18n/client';

export function EditorToolbar({ editor }: { editor: Editor }) {
  const { t } = useTranslation('common');
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((n) => n + 1);
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor]);

  const handleLink = useCallback(() => {
    const existingHref = editor.getAttributes('link').href;
    if (editor.isActive('link')) {
      const url = window.prompt(t('editor.editLinkPrompt'), existingHref || '');
      if (url === null) return;
      if (!url) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: normalizeUrl(url) })
        .run();
      return;
    }
    const url = window.prompt(t('editor.enterUrlPrompt'));
    if (!url) return;
    const href = normalizeUrl(url);
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href } }],
          text: url,
        })
        .run();
    } else {
      editor.chain().focus().setLink({ href }).run();
    }
  }, [editor, t]);

  const btn = (
    active: boolean,
    action: () => void,
    title: string,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      className={`flex items-center justify-center size-6 rounded-sm transition-colors ${active ? 'text-[var(--text-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-1 py-2">
      {btn(
        editor.isActive('bold'),
        () => editor.chain().focus().toggleBold().run(),
        t('editor.toolbar.bold'),
        <Icon variant="textBold" size={16} />
      )}
      {btn(
        editor.isActive('italic'),
        () => editor.chain().focus().toggleItalic().run(),
        t('editor.toolbar.italic'),
        <Icon variant="textItalic" size={16} />
      )}
      {btn(
        editor.isActive('strike'),
        () => editor.chain().focus().toggleStrike().run(),
        t('editor.toolbar.strikethrough'),
        <Icon variant="textStrikethrough" size={16} />
      )}
      {btn(
        editor.isActive('underline'),
        () => editor.chain().focus().toggleUnderline().run(),
        t('editor.toolbar.underline'),
        <Icon variant="textUnderline" size={16} />
      )}

      <div className="w-px h-4 bg-[var(--blackinverse-a6)] mx-1" />

      {btn(
        editor.isActive('link'),
        handleLink,
        t('editor.toolbar.link'),
        <Icon variant="textLink" size={16} />
      )}

      <div className="w-px h-4 bg-[var(--blackinverse-a6)] mx-1" />

      {btn(
        editor.isActive('bulletList'),
        () => editor.chain().focus().toggleBulletList().run(),
        t('editor.toolbar.bulletList'),
        <Icon variant="textList" size={16} />
      )}
      {btn(
        editor.isActive('orderedList'),
        () => editor.chain().focus().toggleOrderedList().run(),
        t('editor.toolbar.numberedList'),
        <Icon variant="textListNumbers" size={16} />
      )}
    </div>
  );
}

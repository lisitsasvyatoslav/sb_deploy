import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FileAttachmentNodeView } from './FileAttachmentNodeView';

export interface FileAttachmentAttrs {
  fileId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  loading: boolean;
}

/**
 * Custom TipTap node for inline file attachments.
 *
 * Serializes to / parses from HTML:
 *   <file-attachment
 *     data-file-id="..."
 *     data-filename="..."
 *     data-file-size="12345"
 *     data-mime-type="application/pdf"
 *     data-file-type="pdf"
 *   ></file-attachment>
 *
 * The HTML is embedded in the markdown string (tiptap-markdown `html: true`).
 */
export const FileAttachmentExtension = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      fileId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-file-id'),
        renderHTML: (attrs) => ({ 'data-file-id': attrs.fileId }),
      },
      filename: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-filename'),
        renderHTML: (attrs) => ({ 'data-filename': attrs.filename }),
      },
      fileSize: {
        default: 0,
        parseHTML: (el) => Number(el.getAttribute('data-file-size')) || 0,
        renderHTML: (attrs) => ({ 'data-file-size': String(attrs.fileSize) }),
      },
      mimeType: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-mime-type'),
        renderHTML: (attrs) => ({ 'data-mime-type': attrs.mimeType }),
      },
      fileType: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-file-type'),
        renderHTML: (attrs) => ({ 'data-file-type': attrs.fileType }),
      },
      loading: {
        default: false,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'file-attachment' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['file-attachment', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNodeView);
  },

  addStorage() {
    return {
      expandedNodes: {} as Record<string, boolean>,
      onAskAIWithFile: null as
        | ((fileId: string, filename: string, mimeType?: string) => void)
        | null,
      markdown: {
        serialize(
          state: {
            write: (s: string) => void;
            closeBlock: (n: unknown) => void;
          },
          node: { attrs: FileAttachmentAttrs }
        ) {
          const { fileId, filename, fileSize, mimeType, fileType } = node.attrs;
          state.write(
            `<file-attachment data-file-id="${fileId}" data-filename="${filename}" data-file-size="${fileSize}" data-mime-type="${mimeType}" data-file-type="${fileType}"></file-attachment>`
          );
          state.closeBlock(node);
        },
        parse: {
          // markdown-it passes unknown HTML blocks through when html: true
        },
      },
    };
  },
});

import { useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { filesApi } from '@/services/api/files';
import { showErrorToast } from '@/shared/utils/toast';

const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.tar,.gz';
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,.svg,.webp,.bmp';
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Returns handlers for inserting file/image attachments into a TipTap editor.
 * Opens a native file picker, uploads via the files API, then inserts
 * a `fileAttachment` node at the current cursor position.
 */
export function useEditorFileUpload(
  editor: Editor | null,
  cardDataId?: number
) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!editor) return;

      if (file.size > MAX_SIZE_BYTES) {
        showErrorToast(`File is too large (max 50 MB): ${file.name}`);
        return;
      }

      // Insert a placeholder node immediately with loading state
      const placeholderId = `upload-${Date.now()}`;
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'fileAttachment',
          attrs: {
            fileId: placeholderId,
            filename: file.name,
            fileSize: file.size,
            mimeType: file.type,
            fileType: '',
            loading: true,
          },
        })
        .run();

      const findPlaceholder = (): number | null => {
        let found: number | null = null;
        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === 'fileAttachment' &&
            node.attrs.fileId === placeholderId
          ) {
            found = pos;
            return false;
          }
        });
        return found;
      };

      try {
        const result = await filesApi.uploadFile(file, cardDataId);
        const pos = findPlaceholder();

        if (pos !== null) {
          const { tr } = editor.state;
          tr.setNodeMarkup(pos, undefined, {
            fileId: result.fileId,
            filename: result.filename,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            fileType: result.fileType ?? '',
            loading: false,
          });
          editor.view.dispatch(tr);
        }
      } catch {
        const pos = findPlaceholder();

        if (pos !== null) {
          const { tr } = editor.state;
          tr.delete(pos, pos + editor.state.doc.nodeAt(pos)!.nodeSize);
          editor.view.dispatch(tr);
        }

        showErrorToast(`Failed to upload file: ${file.name}`);
      }
    },
    [editor, cardDataId]
  );

  const openFilePicker = useCallback(
    (
      accept: string,
      inputRef: React.MutableRefObject<HTMLInputElement | null>
    ) => {
      if (!inputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';

        const cleanup = () => {
          if (input.parentNode) input.parentNode.removeChild(input);
          inputRef.current = null;
        };

        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (file) await upload(file);
          cleanup();
        });
        input.addEventListener('cancel', cleanup);

        document.body.appendChild(input);
        inputRef.current = input;
      }
      inputRef.current.click();
    },
    [upload]
  );

  const handleInsertFile = useCallback(
    () => openFilePicker(FILE_ACCEPT, fileInputRef),
    [openFilePicker]
  );

  const handleInsertImage = useCallback(
    () => openFilePicker(IMAGE_ACCEPT, imageInputRef),
    [openFilePicker]
  );

  return { handleInsertFile, handleInsertImage };
}

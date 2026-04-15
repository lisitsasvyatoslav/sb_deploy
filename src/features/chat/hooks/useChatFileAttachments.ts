import { useCallback, useRef, useState } from 'react';
import { filesApi } from '@/services/api/files';
import { logger } from '@/shared/utils/logger';
import type { Attachment } from '@/features/chat/components/ChatInput';

export interface FileAttachment extends Attachment {
  mimeType?: string;
  fileSize?: number;
  previewUrl?: string; // For image previews (object URL or S3 URL)
}

/**
 * Check if a mime type represents an image
 */
export const isImageMimeType = (mimeType?: string): boolean => {
  return !!mimeType && mimeType.startsWith('image/');
};

/**
 * Check if a filename has an image extension
 */
export const isImageFilename = (filename?: string): boolean => {
  if (!filename) return false;
  const ext = filename.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(
    ext || ''
  );
};

export function useChatFileAttachments() {
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Add files as "pending" for immediate UI
      const pendingFiles = Array.from(files).map((file, index) => {
        // Create object URL for immediate preview if it's an image
        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

        return {
          id: `pending-${Date.now()}-${index}`,
          type: 'file' as const,
          name: file.name,
          file, // store original file for upload
          mimeType: file.type,
          fileSize: file.size,
          previewUrl,
        };
      });

      setAttachedFiles((prev) => [...prev, ...pendingFiles]);
      setIsUploadingFile(true);

      // Upload in background
      for (const pendingFile of pendingFiles) {
        try {
          const response = await filesApi.uploadFile(
            (pendingFile as FileAttachment & { file: File }).file
          );
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === pendingFile.id
                ? {
                    id: response.fileId,
                    type: 'file',
                    name: response.filename,
                    mimeType: response.mimeType,
                    fileSize: response.fileSize,
                    previewUrl: (f as FileAttachment).previewUrl, // Keep the object URL for preview
                  }
                : f
            )
          );
        } catch (err) {
          logger.error('useChatFileAttachments', 'File upload failed', err);
          // Keep pending entry so user sees it and can delete/retry
        }
      }

      setIsUploadingFile(false);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    []
  );

  const handleRemoveAttachment = useCallback((id: number | string) => {
    setAttachedFiles((prev) => {
      // Revoke object URL if it exists to prevent memory leaks
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAttachedFiles = useCallback(() => {
    setAttachedFiles((prev) => {
      // Revoke all object URLs before clearing
      prev.forEach((f) => {
        if (f.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
      return [];
    });
  }, []);

  const getUploadedFileIds = useCallback(() => {
    return attachedFiles
      .filter((f) => !String(f.id).startsWith('pending-'))
      .map((f) => String(f.id));
  }, [attachedFiles]);

  const addExternalFile = useCallback(
    (fileId: string, filename: string, mimeType?: string) => {
      setAttachedFiles((prev) => {
        if (prev.some((f) => String(f.id) === fileId)) return prev;
        return [
          ...prev,
          { id: fileId, type: 'file' as const, name: filename, mimeType },
        ];
      });
    },
    []
  );

  /**
   * Handle pasted file from clipboard
   * This can be used as the onPasteFile callback for ChatInput
   */
  const handlePasteFile = useCallback(async (file: File) => {
    // Generate a name for clipboard images
    let fileName = file.name;
    if (!fileName || fileName === 'image.png' || fileName === 'image') {
      const ext = file.type.split('/')[1] || 'png';
      fileName = `pasted-image-${Date.now()}.${ext}`;
    }

    // Create object URL for immediate preview if it's an image
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    const pendingFile = {
      id: `pending-${Date.now()}`,
      type: 'file' as const,
      name: fileName,
      mimeType: file.type,
      fileSize: file.size,
      previewUrl,
    };

    setAttachedFiles((prev) => [...prev, pendingFile]);
    setIsUploadingFile(true);

    try {
      const response = await filesApi.uploadFile(file);
      setAttachedFiles((prev) =>
        prev.map((f) =>
          f.id === pendingFile.id
            ? {
                id: response.fileId,
                type: 'file',
                name: response.filename,
                mimeType: response.mimeType,
                fileSize: response.fileSize,
                previewUrl: (f as FileAttachment).previewUrl,
              }
            : f
        )
      );
    } catch {
      // Keep pending entry so user can see it and delete/retry
    }

    setIsUploadingFile(false);
  }, []);

  return {
    attachedFiles,
    isUploadingFile,
    fileInputRef,
    handleAttachClick,
    handleFileSelect,
    handlePasteFile,
    handleRemoveFileAttachment: handleRemoveAttachment,
    clearAttachedFiles,
    getUploadedFileIds,
    addExternalFile,
  };
}

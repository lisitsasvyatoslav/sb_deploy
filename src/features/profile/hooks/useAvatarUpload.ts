import { useCallback, useEffect, useRef, useState } from 'react';
import { useUploadAvatarMutation, useDeleteAvatarMutation } from '../queries';
import { showErrorToast } from '@/shared/utils/toast';
import { useTranslation } from '@/shared/i18n/client';

export function useAvatarUpload() {
  const { t } = useTranslation('profile');
  const uploadMutation = useUploadAvatarMutation();
  const deleteMutation = useDeleteAvatarMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Single cleanup path: revoke old ObjectURL whenever cropImageSrc changes or on unmount
  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  const handleAvatarAction = useCallback((value: string) => {
    if (value === 'select') {
      fileInputRef.current?.click();
    } else if (value === 'delete') {
      setDeleteModalOpen(true);
    }
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => setDeleteModalOpen(false),
      onError: () => {
        showErrorToast(t('myProfile.avatarDeleteError'));
        setDeleteModalOpen(false);
      },
    });
  }, [deleteMutation, t]);

  const handleDeleteModalClose = useCallback(
    (open: boolean) => {
      if (!deleteMutation.isPending) setDeleteModalOpen(open);
    },
    [deleteMutation.isPending]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
      setCropModalOpen(true);

      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    []
  );

  const handleCropSave = useCallback(
    (blob: Blob) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      uploadMutation.mutate(
        { file: blob, signal: controller.signal },
        {
          onSuccess: () => {
            abortControllerRef.current = null;
            setCropModalOpen(false);
            setCropImageSrc(null);
          },
          onError: (error) => {
            abortControllerRef.current = null;
            if (error instanceof Error && error.name !== 'AbortError') {
              showErrorToast(t('myProfile.avatarUploadError'));
            }
            setCropImageSrc(null);
          },
        }
      );
    },
    [uploadMutation, t]
  );

  const handleCropModalClose = useCallback((open: boolean) => {
    if (!open) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setCropImageSrc(null);
    }
    setCropModalOpen(open);
  }, []);

  return {
    fileInputRef,
    cropImageSrc,
    cropModalOpen,
    deleteModalOpen,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleAvatarAction,
    handleFileSelect,
    handleCropSave,
    handleCropModalClose,
    handleDeleteConfirm,
    handleDeleteModalClose,
  };
}

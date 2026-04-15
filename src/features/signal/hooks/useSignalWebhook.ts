import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { SignalSourceType } from '@/types';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';
import type { SignalListResponse } from '@/types/signal';
import {
  useCreateSignalWebhookMutation,
  useGenerateWebhookUrlMutation,
  useSignalHistoryQuery,
  useSignalWebhookQuery,
  useUpdateSignalWebhookMutation,
} from '@/features/signal/queries';

const SIGNAL_HISTORY_LIMIT = 1000;

export interface UseSignalWebhookConfig {
  signalWebhookId: number;
  boardId: number;
  mode: 'create' | 'edit' | 'view';
  enabled?: boolean;
}

export interface UseSignalWebhookReturn {
  description: string;
  setDescription: (v: string) => void;
  showToastNotification: boolean;
  setShowToastNotification: (v: boolean) => void;
  generatedUrl: { secretToken: string; webhookUrl: string } | null;
  signalHistoryData: SignalListResponse | undefined;
  isLoadingHistory: boolean;
  historyError: Error | null;
  isGeneratingUrl: boolean;
  isSaving: boolean;
  isSaveDisabled: boolean;
  handleSave: () => Promise<void>;
  resetState: () => void;
}

export function useSignalWebhook({
  signalWebhookId,
  boardId,
  mode,
  enabled = true,
}: UseSignalWebhookConfig): UseSignalWebhookReturn {
  const { t } = useTranslation('signal');

  const [showToastNotification, setShowToastNotification] = useState(true);
  const [description, setDescription] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<{
    secretToken: string;
    webhookUrl: string;
  } | null>(null);

  const createWebhookMutation = useCreateSignalWebhookMutation();
  const updateWebhookMutation = useUpdateSignalWebhookMutation();
  const generateWebhookUrlMutation = useGenerateWebhookUrlMutation();

  const { data: webhookData } = useSignalWebhookQuery(
    signalWebhookId || 0,
    enabled && mode !== 'create' && !!signalWebhookId
  );

  const {
    data: signalHistoryData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useSignalHistoryQuery(
    signalWebhookId || 0,
    SIGNAL_HISTORY_LIMIT,
    enabled && mode !== 'create' && !!signalWebhookId
  );

  // Generate webhook URL on create mode
  useEffect(() => {
    if (enabled && mode === 'create') {
      setGeneratedUrl(null);
      generateWebhookUrlMutation.mutate(undefined, {
        onSuccess: (data) => {
          setGeneratedUrl({
            secretToken: data.secretToken,
            webhookUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.webhookUrl}`,
          });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, mode]);

  // Populate state from webhook data on edit/view
  useEffect(() => {
    if (mode !== 'create' && webhookData) {
      setDescription(webhookData.description || '');
      setShowToastNotification(webhookData.showToastNotification);
      setGeneratedUrl({
        secretToken: '',
        webhookUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}${webhookData.webhookUrl}`,
      });
    }
  }, [mode, webhookData]);

  const handleSave = async () => {
    if (mode === 'create') {
      if (!boardId) {
        showErrorToast(t('toast.boardNotSelected'));
        return;
      }
      if (!generatedUrl) {
        showErrorToast(t('toast.webhookNotGenerated'));
        return;
      }
      try {
        await createWebhookMutation.mutateAsync({
          boardId,
          sourceType: SignalSourceType.TRADINGVIEW,
          secretToken: generatedUrl.secretToken,
          description: description || undefined,
          showToastNotification,
        });
        showSuccessToast(t('toast.created'));
      } catch (error) {
        logger.error(
          'useSignalWebhook',
          'Failed to create signal webhook',
          error
        );
        showErrorToast(t('toast.createError'));
      }
    } else if (mode === 'edit') {
      if (!signalWebhookId) {
        showErrorToast(t('toast.notFound'));
        return;
      }
      try {
        const effectiveBoardId = webhookData?.boardId || boardId;
        await updateWebhookMutation.mutateAsync({
          id: signalWebhookId,
          data: {
            description: description || undefined,
            showToastNotification,
          },
          boardId: effectiveBoardId,
        });
        showSuccessToast(t('toast.updated'));
      } catch (error) {
        logger.error(
          'useSignalWebhook',
          'Failed to update signal webhook',
          error
        );
        showErrorToast(t('toast.updateError'));
      }
    }
  };

  const resetState = () => {
    setDescription('');
    setShowToastNotification(true);
    setGeneratedUrl(null);
  };

  const isSaving =
    createWebhookMutation.isPending || updateWebhookMutation.isPending;

  const isSaveDisabled =
    mode === 'create'
      ? createWebhookMutation.isPending || !boardId || !generatedUrl
      : updateWebhookMutation.isPending || !signalWebhookId;

  return {
    description,
    setDescription,
    showToastNotification,
    setShowToastNotification,
    generatedUrl,
    signalHistoryData,
    isLoadingHistory,
    historyError,
    isGeneratingUrl: generateWebhookUrlMutation.isPending,
    isSaving,
    isSaveDisabled,
    handleSave,
    resetState,
  };
}

/**
 * useSignalToggle Hook
 * Manages signal toggle state and activation logic
 */

import { useUpdateSignalWebhookMutation } from '@/features/signal/queries';
import { useTranslation } from '@/shared/i18n/client';
import type { SignalWebhook } from '@/types';
import { logger } from '@/shared/utils/logger';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseSignalToggleOptions {
  webhooks: SignalWebhook[];
  boardId: number | null;
}

export const useSignalToggle = ({
  webhooks,
  boardId,
}: UseSignalToggleOptions) => {
  const { t } = useTranslation('signal');
  const updateWebhookMutation = useUpdateSignalWebhookMutation();

  // Local toggle state (for when there are no webhooks)
  const [localToggleState, setLocalToggleState] = useState(false);

  // Check if all webhooks are active
  const allActive = useMemo(() => {
    if (webhooks.length === 0) return false;
    return webhooks.every((webhook) => webhook.active);
  }, [webhooks]);

  // Visual state of the toggle button
  const isSignalsWorking = webhooks.length > 0 ? allActive : localToggleState;

  // Sync local toggle state with actual webhooks state
  useEffect(() => {
    if (webhooks.length > 0) {
      // When webhooks exist, sync with their active state
      setLocalToggleState(allActive);
    } else {
      // When no webhooks, reset to default (inactive)
      setLocalToggleState(false);
    }
  }, [allActive, webhooks.length]);

  const toggleSignalsState = useCallback(async () => {
    const newActiveState = !isSignalsWorking;

    // Update local state immediately for visual feedback
    setLocalToggleState(newActiveState);

    // If there are webhooks, update them
    if (webhooks.length > 0) {
      try {
        // Update all webhooks
        await Promise.all(
          webhooks.map((webhook) =>
            updateWebhookMutation.mutateAsync({
              id: webhook.id,
              data: { active: newActiveState },
              boardId: boardId ?? undefined,
            })
          )
        );

        showSuccessToast(
          newActiveState ? t('toggle.activated') : t('toggle.deactivated')
        );
      } catch (error) {
        logger.error('useSignalToggle', 'Failed to update webhooks', error);
        showErrorToast(t('toggle.updateError'));
        // Revert local state on error
        setLocalToggleState(!newActiveState);
      }
    }
    // If no webhooks, just update local state without showing toast
  }, [t, webhooks, isSignalsWorking, updateWebhookMutation, boardId]);

  return {
    isSignalsWorking,
    toggleSignalsState,
    isLoading: updateWebhookMutation.isPending,
  };
};

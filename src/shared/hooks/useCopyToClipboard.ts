/**
 * Shared hook for copying text to clipboard with notification
 */

import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { useCallback } from 'react';

export const useCopyToClipboard = () => {
  const { t } = useTranslation('common');

  return useCallback(
    (text: string, successMessage?: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showSuccessToast(successMessage || t('clipboard.copied'));
        })
        .catch((error) => {
          logger.error(
            'useCopyToClipboard',
            'Failed to copy to clipboard',
            error
          );
          showErrorToast(t('clipboard.copyFailed'));
        });
    },
    [t]
  );
};

'use client';

import React from 'react';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { useInitStrategyBindingMutation } from '@/features/strategy-binding/queries';
import { showErrorToast } from '@/shared/utils/toast';

const BindComonButton: React.FC = () => {
  const { t } = useTranslation('common');
  const initMutation = useInitStrategyBindingMutation();

  const handleClick = async () => {
    try {
      // TODO [MOCK]: After backend implementation (TD-983) this call will remain,
      // but will return the real comon.ru URL instead of the mock page.
      const result = await initMutation.mutateAsync();
      window.location.href = result.comonRedirectUrl;
    } catch {
      showErrorToast(t('strategyBinding.initError'));
    }
  };

  return (
    <Button
      variant="secondary"
      size="md"
      fullWidth
      loading={initMutation.isPending}
      onClick={handleClick}
    >
      {initMutation.isPending
        ? t('strategyBinding.bindingInProgress')
        : t('strategyBinding.bindButton')}
    </Button>
  );
};

export default BindComonButton;

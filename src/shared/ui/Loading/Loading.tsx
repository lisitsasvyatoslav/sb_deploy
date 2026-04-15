'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

export const Loading: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-base">
      <div className="text-center">
        <h2 className="text-accent text-2xl font-semibold">{t('loading')}</h2>
      </div>
    </div>
  );
};

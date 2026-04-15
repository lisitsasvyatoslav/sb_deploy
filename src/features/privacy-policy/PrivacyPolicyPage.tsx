'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { useLegalDoc } from '@/features/legal/hooks/useLegalDoc';
import LegalDocContent from '@/features/legal/components/LegalDocContent';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { content, loading, error } = useLegalDoc(
    '/privacy-policy',
    t('policy.loadError')
  );

  return (
    <div className="px-spacing-32 pt-spacing-32 pb-spacing-64 max-w-[720px]">
      <LegalDocContent content={content} loading={loading} error={error} />
    </div>
  );
};

export default PrivacyPolicyPage;

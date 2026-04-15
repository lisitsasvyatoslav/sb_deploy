'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { LEGAL_DOCS_META } from '@/features/legal/utils/legalDocUtils';
import { useLegalDoc } from '@/features/legal/hooks/useLegalDoc';
import LegalDocContent from '@/features/legal/components/LegalDocContent';

interface Props {
  doc: string;
}

const LegalDocAppPage: React.FC<Props> = ({ doc }) => {
  const router = useRouter();
  const { t } = useTranslation('profile');
  const meta = LEGAL_DOCS_META.find((d) => d.key === doc);
  const { content, loading, error } = useLegalDoc(
    meta?.apiPath ?? '',
    t('legal.loadError')
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-spacing-32 pt-spacing-32 pb-spacing-64">
        <div className="max-w-[720px] mx-auto">
          <Button
            size="md"
            variant="ghost"
            icon="chevronLeft"
            onClick={() => router.push('/profile/legal')}
            className="mb-spacing-24 -ml-spacing-8"
          >
            {t('nav.back')}
          </Button>

          <LegalDocContent
            content={content}
            loading={loading}
            error={error ?? (!meta ? t('legal.loadError') : null)}
          />
        </div>
      </div>
    </div>
  );
};

export default LegalDocAppPage;

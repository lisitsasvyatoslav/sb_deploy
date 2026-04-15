'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { LEGAL_DOCS_META } from '@/features/legal/utils/legalDocUtils';

const LegalSection: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col items-start gap-spacing-20 w-[432px]">
      <div className="text-20 font-semibold leading-24 tracking-tight-2 text-blackinverse-a100 px-spacing-16">
        {t('sectionTitles.legal')}
      </div>

      <div className="flex flex-col self-stretch">
        {LEGAL_DOCS_META.map((doc) => (
          <button
            key={doc.key}
            type="button"
            onClick={() => router.push(doc.appPath)}
            className="flex items-center gap-spacing-12 h-[40px] px-spacing-16 w-full text-left bg-transparent border-none cursor-pointer rounded-none transition-colors hover:bg-blackinverse-a6"
          >
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-14 font-semibold leading-20 tracking-tight-1 text-blackinverse-a100">
              {t(doc.labelKey)}
            </span>
            <Icon
              variant="chevronRight"
              size={20}
              className="text-blackinverse-a56 shrink-0"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegalSection;

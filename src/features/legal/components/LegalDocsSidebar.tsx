'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/client';
import { LEGAL_DOCS_META } from '@/features/legal/utils/legalDocUtils';

export default function LegalDocsSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation('profile');

  return (
    <aside className="w-64 min-w-64 border-r border-blackinverse-a12 px-spacing-8 pt-spacing-32">
      <p className="px-spacing-8 mb-spacing-8 text-12 font-semibold leading-16 tracking-wide uppercase text-blackinverse-a56">
        {t('legal.documents')}
      </p>

      <nav className="flex flex-col gap-spacing-4">
        {LEGAL_DOCS_META.map((doc) => (
          <Link
            key={doc.key}
            href={doc.guestPath}
            className={[
              'block px-spacing-8 py-spacing-8 rounded-lg text-14 leading-20 tracking-tight-1 transition-colors',
              pathname === doc.guestPath
                ? 'font-semibold text-blackinverse-a100 bg-blackinverse-a6'
                : 'font-normal text-blackinverse-a56 hover:bg-blackinverse-a6 hover:text-blackinverse-a100',
            ].join(' ')}
          >
            {t(doc.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

'use client';

import { useTranslation } from '@/shared/i18n/client';

const LINKS = {
  bugBounty: 'https://app-collab.finam.ru/bugbounty',
  telegram: 'https://t.me/+sT39l5GVcGljOTdi',
  webinar:
    'https://education.finam.ru/course-webinar/dnevnik-treidera-kak-fiksirovat-idei-testirovat-strategii-i-prinimat-reseniia-s-pomoshhiu-ii/',
};

const BASE_LINK_CLASS =
  'text-brand-base hover:opacity-80 transition-opacity cursor-pointer';

const BoardBetaBanner = () => {
  const { t } = useTranslation('board');

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-4 text-right text-12 font-normal leading-16 tracking-tight-1 text-blackinverse-a100 pointer-events-none">
      <p>{t('betaBanner.description')}</p>
      <p className="pointer-events-auto">
        <a
          href={LINKS.bugBounty}
          target="_blank"
          rel="noopener noreferrer"
          className={BASE_LINK_CLASS}
        >
          {t('betaBanner.bugBounty')}
        </a>
        <span className="mx-1 text-blackinverse-a56">|</span>
        <a
          href={LINKS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={BASE_LINK_CLASS}
        >
          {t('betaBanner.telegram')}
        </a>
        <span className="mx-1 text-blackinverse-a56">|</span>
        <a
          href={LINKS.webinar}
          target="_blank"
          rel="noopener noreferrer"
          className={BASE_LINK_CLASS}
        >
          {t('betaBanner.webinar')}
        </a>
      </p>
    </div>
  );
};

export default BoardBetaBanner;

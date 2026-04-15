import { useTranslation } from '@/shared/i18n/client';
import Image from 'next/image';
import React from 'react';

interface LinkMeta {
  og_image?: string;
  og_description?: string;
}

interface LinkContentProps {
  meta?: LinkMeta;
}

export const LinkContent: React.FC<LinkContentProps> = ({ meta }) => {
  const { t } = useTranslation('board');
  const ogImage = meta?.og_image;
  const ogDescription = meta?.og_description || t('link.noDescription');

  return (
    <div className="box-border flex flex-col gap-[8px] h-full items-start pb-[2px] pt-0 px-0 w-full">
      <div className="flex flex-col gap-[10px] grow items-start min-h-0 min-w-0 px-[8px] py-0 w-full">
        <div className="bg-background-preview flex flex-col grow items-center justify-between min-h-0 min-w-0 pl-80 pr-[88px] py-0 rounded-12 w-full">
          <div className="grow min-h-0 min-w-0 relative w-full">
            {ogImage ? (
              <Image
                alt="Link preview"
                className="absolute inset-0 object-contain pointer-events-none w-full h-full"
                src={ogImage}
                width={400}
                height={300}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-background-preview rounded-12 flex items-center justify-center">
                <span className="theme-text-secondary text-12">
                  {t('link.noPreview')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-[10px] items-center justify-center px-[12px] py-0 w-full">
        <p className="line-clamp-2 font-normal text-10 theme-text-secondary tracking-[0.1px] overflow-hidden">
          {ogDescription}
        </p>
      </div>
    </div>
  );
};

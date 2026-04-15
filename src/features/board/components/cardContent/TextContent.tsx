import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

interface TextContentProps {
  content: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content }) => {
  const { t } = useTranslation('board');
  if (!content) {
    return (
      <div className="box-border flex flex-col gap-[8px] h-full items-start pb-[12px] pt-[2px] px-[12px] w-full">
        <p className="line-clamp-[11] font-normal text-[14px] theme-text-primary leading-[20px] tracking-[-0.2px] overflow-hidden">
          {t('cardContent.noDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="box-border flex flex-col gap-[8px] h-full items-start pb-[12px] pt-[2px] px-[12px] w-full">
      <div className="line-clamp-[11] font-normal text-[14px] theme-text-primary leading-[20px] tracking-[-0.2px] overflow-hidden prose prose-sm max-w-none">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

interface NewsContentProps {
  content: string;
}

export const NewsContent: React.FC<NewsContentProps> = ({ content }) => {
  const { t } = useTranslation('board');
  return (
    <div className="box-border flex flex-col gap-[8px] h-full items-start px-[12px] py-[2px] w-full">
      <div className="line-clamp-[10] font-normal text-[14px] theme-text-primary leading-[20px] tracking-[-0.2px] overflow-hidden prose prose-sm max-w-none">
        <MarkdownRenderer content={content || t('cardContent.noDescription')} />
      </div>
    </div>
  );
};

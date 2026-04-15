import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

interface AiAnswerContentProps {
  content: string;
}

export const AiAnswerContent: React.FC<AiAnswerContentProps> = ({
  content,
}) => {
  const { t } = useTranslation('board');
  if (!content) {
    return (
      <div className="box-border flex flex-col gap-[8px] h-full items-start pb-[16px] pt-[2px] px-[12px] w-full">
        <div className="line-clamp-[9] font-normal text-[14px] theme-text-primary leading-[20px] tracking-[-0.2px] overflow-hidden">
          {t('cardContent.noAnswer')}
        </div>
      </div>
    );
  }

  return (
    <div className="box-border flex flex-col gap-[8px] h-full items-start pb-[16px] pt-[2px] px-[12px] w-full">
      <div className="line-clamp-[9] font-normal text-[14px] theme-text-primary leading-[20px] tracking-[-0.2px] overflow-hidden prose prose-sm max-w-none">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

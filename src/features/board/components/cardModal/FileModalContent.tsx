'use client';

import { useTranslation } from '@/shared/i18n/client';
import FileDetailContent, {
  useFilePreview,
} from '@/features/ticker/components/FileDetailContent';
import type { Card } from '@/types';

interface FileModalContentProps {
  card: Card;
}

export function FileModalContent({ card }: FileModalContentProps) {
  const { t } = useTranslation('board');

  const cardFileId = (card.meta?.file_id || card.meta?.fileId) as
    | string
    | undefined;
  const fileName =
    card.meta?.filename || card.title || t('filePreview.fileDefault');
  const hasFile = !!cardFileId;

  const {
    fileUrl,
    isLoadingContent,
    textContent,
    contentError,
    setContentError,
  } = useFilePreview(cardFileId, fileName);

  if (!hasFile) {
    return (
      <div className="flex items-center justify-center h-[200px] text-blackinverse-a56">
        {t('filePreview.notFound')}
      </div>
    );
  }

  return (
    <FileDetailContent
      card={card}
      fileUrl={fileUrl}
      isLoadingContent={isLoadingContent}
      textContent={textContent}
      contentError={contentError}
      onContentError={setContentError}
    />
  );
}

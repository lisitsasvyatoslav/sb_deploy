import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Article as NewsIcon } from '@mui/icons-material';
import { useTranslation } from '@/shared/i18n/client';
import { useNewsPreviewStore } from '@/stores/newsPreviewStore';
import NewsDetailContent from '@/features/ticker/components/NewsDetailContent';

const NewsPreviewModal: React.FC = () => {
  const { t } = useTranslation('common');
  const { isOpen, card, news, closeModal } = useNewsPreviewStore();

  // Extract data from either card or news
  const isCardSource = !!card;
  const newsUrl = isCardSource ? card.meta?.url : news?.url;
  const ogImage = isCardSource
    ? card.meta?.ogImage || card.meta?.imageUrl
    : undefined;
  const ogTitle = isCardSource
    ? card.meta?.ogTitle || card.title
    : news?.headline;
  const newsSource = isCardSource ? card.meta?.source : news?.source;
  const publishedAt = isCardSource ? card.meta?.publishedAt : undefined;
  const rawTimestamp = !isCardSource ? news?.timestamp : undefined;
  const newsDate =
    !isCardSource && news && news.date && news.time
      ? `${news.date}, ${news.time}`
      : undefined;

  const cardContent = isCardSource
    ? card.content || card.meta?.ogDescription
    : undefined;
  const newsArticleContent = !isCardSource ? news?.content : undefined;

  const handleOpenOriginal = () => {
    if (newsUrl) {
      window.open(newsUrl, '_blank');
    }
  };

  if (!isOpen || (!card && !news)) return null;

  const headerContent = (
    <div className="flex items-center gap-3">
      <NewsIcon className="!text-3xl !text-accent" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {t('news.title')}
        </h2>
        {newsSource && (
          <p className="text-sm text-[var(--text-secondary)]">{newsSource}</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      maxWidth="md"
      zIndex={1500}
    >
      <ModalHeader className="pt-2">{headerContent}</ModalHeader>
      <ModalBody padding="none">
        <NewsDetailContent
          title={ogTitle || ''}
          content={cardContent}
          htmlContent={newsArticleContent}
          ogImage={ogImage}
          tags={isCardSource ? card.tags : undefined}
          date={publishedAt || rawTimestamp || newsDate}
        />
      </ModalBody>
      <ModalFooter align="between">
        <Button variant="secondary" size="md" onClick={closeModal}>
          {t('news.close')}
        </Button>
        {newsUrl && (
          <Button
            variant="accent"
            size="md"
            icon={<OpenInNewIcon />}
            onClick={handleOpenOriginal}
          >
            {t('news.readOriginal')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default NewsPreviewModal;

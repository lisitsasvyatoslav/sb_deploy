'use client';

import NewsDetailContent from '@/features/ticker/components/NewsDetailContent';
import type { Card } from '@/types';

interface NewsModalContentProps {
  card: Card;
}

export function NewsModalContent({ card }: NewsModalContentProps) {
  const ogImage = card.meta?.ogImage || card.meta?.imageUrl;
  const ogTitle = card.meta?.ogTitle || card.title;
  const publishedAt = card.meta?.publishedAt;
  const cardContent = card.content || card.meta?.ogDescription;

  return (
    <NewsDetailContent
      title={ogTitle || ''}
      content={cardContent}
      ogImage={ogImage}
      tags={card.tags}
      date={publishedAt}
    />
  );
}

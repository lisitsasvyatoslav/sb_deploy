import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/types';
import { Article as NewsIcon } from '@mui/icons-material';

export interface NewsPreviewProps {
  card: Card;
  className?: string;
}

/**
 * Компонент для отображения preview новостей
 * Показывает OG изображение если есть, иначе fallback иконку
 */
const NewsPreview: React.FC<NewsPreviewProps> = ({ card, className = '' }) => {
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Извлекаем OG изображение из метаданных или URL
  useEffect(() => {
    const imageUrl = card.meta?.ogImage || card.meta?.imageUrl;
    if (imageUrl) {
      setOgImage(imageUrl);
    } else if (card.meta?.url) {
      // Здесь можно добавить логику извлечения OG изображения из URL
      // Пока используем fallback
      setOgImage(null);
    }
  }, [card.meta]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (ogImage && !imageError) {
    return (
      <div className={`card-preview news-preview ${className}`}>
        <Image
          src={ogImage}
          alt="News preview"
          className="preview-image"
          width={400}
          height={300}
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div
      className={`card-preview news-preview preview-fallback ${className}`}
      data-testid="news-fallback-icon"
    >
      <div className="icon">
        <NewsIcon className="!text-5xl !text-accent" />
      </div>
      <div className="text">News</div>
    </div>
  );
};

export default NewsPreview;

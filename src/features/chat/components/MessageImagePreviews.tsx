import Image from 'next/image';
import React from 'react';

export interface ImagePreview {
  id: string;
  url: string;
  name?: string;
}

interface MessageImagePreviewsProps {
  /** List of images to display */
  images: ImagePreview[];
  /** Maximum number of images to show (default 4) */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays image thumbnails to the left of a user message.
 * Shows up to maxVisible images (default 4) as 48x48 thumbnails with 2px border radius.
 */
const MessageImagePreviews: React.FC<MessageImagePreviewsProps> = ({
  images,
  maxVisible = 4,
  className = '',
}) => {
  if (!images || images.length === 0) return null;

  const visibleImages = images.slice(0, maxVisible);

  return (
    <div className={`flex items-center gap-2 mb ${className}`}>
      {visibleImages.map((image) => (
        <div
          key={image.id}
          className="w-[48px] h-[48px] rounded-[2px] overflow-hidden flex-shrink-0 bg-whiteinverse-a8"
        >
          <Image
            src={image.url}
            alt={image.name || 'Attached image'}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default MessageImagePreviews;

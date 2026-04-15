import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { Card, CreateCardRequest } from '@/types';
import { logger } from '../utils/logger';
import {
  isValidUrl,
  extractOGMetadata,
  createFallbackMetadata,
  processImageUrl,
} from '../utils/ogExtractor';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../utils/toast';

interface UseOGCardProps {
  boardId: number;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  handleDeleteCard: (cardId: number) => Promise<void>;
  handleCardDoubleClick: (card: Card) => void;
  createElementWithPosition: (
    elementData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'>,
    elementType: 'card',
    position: { x: number; y: number }
  ) => Promise<Card>;
}

interface UseOGCardReturn {
  createOGCard: (
    url: string,
    position: { x: number; y: number }
  ) => Promise<Card>;
  processUrlPaste: (
    textData: string,
    position: { x: number; y: number }
  ) => Promise<void>;
}

const createOGCardData = async (
  url: string,
  boardId: number,
  position: { x: number; y: number },
  createElementWithPosition: (
    elementData: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'>,
    elementType: 'card',
    position: { x: number; y: number }
  ) => Promise<Card>,
  t: TranslateFn
): Promise<Card> => {
  try {
    let metadata = await extractOGMetadata(url);

    if (!metadata) {
      metadata = createFallbackMetadata(url, t);
    }

    if (metadata.image) {
      metadata.image = processImageUrl(metadata.image, url);
    }

    const decodeHtmlEntities = (text: string): string => {
      if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
      } else {
        return text
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ');
      }
    };

    const textContent = [
      decodeHtmlEntities(metadata.title || t('ogCard.link')),
      decodeHtmlEntities(metadata.description || ''),
      t('ogCard.linkWithUrl', { url }),
      metadata.siteName
        ? t('ogCard.sitePrefix', {
            site: decodeHtmlEntities(metadata.siteName),
          })
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const htmlContent = `
      <div class="og-card">
        ${metadata.image ? `<img src="${metadata.image}" alt="${metadata.title || 'Preview'}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />` : ''}
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${metadata.title || t('ogCard.link')}</h3>
        ${metadata.description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666; line-height: 1.4;">${metadata.description}</p>` : ''}
        <a href="${url}" target="_blank" style="font-size: 12px; color: #0066cc; text-decoration: none;">${url}</a>
      </div>
    `;

    const newCard: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'> = {
      boardId: boardId,
      title: decodeHtmlEntities(
        metadata.title ||
          t('ogCard.linkWithDate', { date: new Date().toLocaleString() })
      ),
      content: textContent,
      type: 'note',
      meta: {
        ogMetadata: metadata,
        originalUrl: url,
        htmlContent: htmlContent,
        previewImage: metadata.image,
        imageUrl: metadata.image,
      },
    };

    const createdCard = await createElementWithPosition(
      newCard,
      'card',
      position
    );

    return createdCard;
  } catch (error) {
    logger.error('useOGCard', 'Error creating OG card', error);
    throw error;
  }
};

export const useOGCard = ({
  boardId,
  setNodes,
  handleDeleteCard,
  handleCardDoubleClick,
  createElementWithPosition,
}: UseOGCardProps): UseOGCardReturn => {
  const { t } = useTranslation('board');

  const createOGCard = useCallback(
    async (url: string, position: { x: number; y: number }) => {
      try {
        showInfoToast(t('ogCard.processingLink'));

        const createdCard = await createOGCardData(
          url,
          boardId,
          position,
          createElementWithPosition,
          t as TranslateFn
        );

        showSuccessToast(t('ogCard.linkInserted'));

        const newNode: Node = {
          id: `card-${createdCard.id}`,
          type: 'cardNode',
          position,
          data: {
            ...createdCard,
            onDelete: handleDeleteCard,
            onDoubleClick: handleCardDoubleClick,
          },
        };

        setNodes((prev) => [...prev, newNode]);
        return createdCard;
      } catch (error) {
        logger.error('useOGCard', 'Error creating OG card', error);

        const fallbackMetadata = createFallbackMetadata(url, t as TranslateFn);

        const newCard: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'> = {
          boardId: boardId,
          title:
            fallbackMetadata.title ||
            t('ogCard.linkWithDate', { date: new Date().toLocaleString() }),
          content: [
            fallbackMetadata.title || t('ogCard.link'),
            fallbackMetadata.description || '',
            t('ogCard.linkWithUrl', { url }),
            fallbackMetadata.siteName
              ? t('ogCard.sitePrefix', { site: fallbackMetadata.siteName })
              : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          type: 'note',
          meta: {
            ogMetadata: fallbackMetadata,
            originalUrl: url,
            isFallback: true,
            previewImage: fallbackMetadata.image,
            imageUrl: fallbackMetadata.image,
          },
        };

        const createdCard = await createElementWithPosition(
          newCard,
          'card',
          position
        );

        showSuccessToast(t('ogCard.linkInsertedShort'));

        const newNode: Node = {
          id: `card-${createdCard.id}`,
          type: 'cardNode',
          position,
          data: {
            ...createdCard,
            onDelete: handleDeleteCard,
            onDoubleClick: handleCardDoubleClick,
          },
        };

        setNodes((prev) => [...prev, newNode]);
        return createdCard;
      }
    },
    [
      t,
      boardId,
      setNodes,
      handleDeleteCard,
      handleCardDoubleClick,
      createElementWithPosition,
    ]
  );

  const processUrlPaste = useCallback(
    async (textData: string, position: { x: number; y: number }) => {
      const isUrl = isValidUrl(textData.trim());

      if (isUrl) {
        await createOGCard(textData.trim(), position);
      } else {
        try {
          const newCard: Omit<CreateCardRequest, 'x' | 'y' | 'zIndex'> = {
            boardId: boardId,
            title: t('ogCard.pastedText', {
              date: new Date().toLocaleString(),
            }),
            content: textData,
            type: 'note',
          };

          const createdCard = await createElementWithPosition(
            newCard,
            'card',
            position
          );

          showSuccessToast(t('ogCard.textInserted'));

          const newNode: Node = {
            id: `card-${createdCard.id}`,
            type: 'cardNode',
            position,
            data: {
              ...createdCard,
              onDelete: handleDeleteCard,
              onDoubleClick: handleCardDoubleClick,
            },
          };

          setNodes((prev) => [...prev, newNode]);
        } catch {
          showErrorToast(t('ogCard.pasteError'));
        }
      }
    },
    [
      t,
      boardId,
      setNodes,
      handleDeleteCard,
      handleCardDoubleClick,
      createElementWithPosition,
      createOGCard,
    ]
  );

  return {
    createOGCard,
    processUrlPaste,
  };
};

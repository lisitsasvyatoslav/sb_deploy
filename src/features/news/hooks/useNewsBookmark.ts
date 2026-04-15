import { useCallback, useRef } from 'react';
import type { NewsItem } from 'finsignal-feed-explore';
import type { CreateCardRequest } from '@/types';
import { logger } from '@/shared/utils/logger';
import {
  usePositionedCreateCardMutation,
  useDeleteCardMutation,
} from '@/features/board/queries';
import {
  getViewportCenter,
  DEFAULT_VIEWPORT,
} from '@/features/board/utils/viewportUtils';
import { buildNewsCardRequest } from '@/features/board/utils/newsCardBuilder';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { useYandexMetrika } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';

interface UseNewsBookmarkParams {
  boardId: number | null;
  viewport: { x: number; y: number; zoom: number } | null;
  setPendingNews: (news: NewsItem | null) => void;
  setPendingAction: (action: 'bookmark' | 'ai') => void;
}

export function useNewsBookmark({
  boardId,
  viewport,
  setPendingNews,
  setPendingAction,
}: UseNewsBookmarkParams) {
  const { t } = useTranslation('common');
  const { trackEvent } = useYandexMetrika();
  const bookmarkedNewsRef = useRef<Map<string, number>>(new Map());
  const createCardMutation = usePositionedCreateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();

  const buildNewsCardData = useCallback(
    (news: NewsItem, targetBoardId: number): CreateCardRequest => {
      const position = getViewportCenter(viewport || DEFAULT_VIEWPORT);
      return buildNewsCardRequest(news, targetBoardId, position);
    },
    [viewport]
  );

  const handleAddNewsToBoardIds = useCallback(
    async (news: NewsItem, boardIds: number[]) => {
      const settled = await Promise.allSettled(
        boardIds.map(async (targetBoardId) => {
          const cardData = buildNewsCardData(news, targetBoardId);
          const createdCard = await createCardMutation.mutateAsync(cardData);
          bookmarkedNewsRef.current.set(news.id, createdCard.id);
          return createdCard.id;
        })
      );

      const results: number[] = [];
      settled.forEach((r) => {
        if (r.status === 'fulfilled') {
          results.push(r.value);
        } else {
          logger.error('NewsSidebar', 'Failed to add news to board', r.reason);
          showErrorToast(t('selectBoardForNews.newsAddError'));
        }
      });

      if (results.length > 0) {
        const msg =
          results.length === 1
            ? t('selectBoardForNews.newsAdded')
            : t('selectBoardForNews.newsAddedToBoards', {
                count: results.length,
              });
        showSuccessToast(msg);
      }
      return results;
    },
    [buildNewsCardData, createCardMutation, t]
  );

  const handleBookmarkClick = useCallback(
    async (news: NewsItem) => {
      if (!boardId) {
        setPendingNews(news);
        setPendingAction('bookmark');
        return;
      }

      const existingCardId = bookmarkedNewsRef.current.get(news.id);
      if (existingCardId) {
        try {
          await deleteCardMutation.mutateAsync({
            cardId: existingCardId,
            boardId,
          });
          bookmarkedNewsRef.current.delete(news.id);
        } catch (error) {
          logger.error(
            'NewsSidebar',
            'Failed to remove news from board',
            error
          );
        }
        return;
      }

      try {
        const cardData = buildNewsCardData(news, boardId);
        const createdCard = await createCardMutation.mutateAsync(cardData);
        bookmarkedNewsRef.current.set(news.id, createdCard.id);
        trackEvent('explore_bookmark_click', {
          board_id: boardId,
          news_id: news.id,
          ticker: news.stocks?.[0]?.symbol,
        });
      } catch (error) {
        logger.error('NewsSidebar', 'Failed to add news to board', error);
      }
    },
    [
      boardId,
      buildNewsCardData,
      createCardMutation,
      deleteCardMutation,
      trackEvent,
      setPendingNews,
      setPendingAction,
    ]
  );

  return {
    bookmarkedNewsRef,
    buildNewsCardData,
    handleAddNewsToBoardIds,
    handleBookmarkClick,
  };
}

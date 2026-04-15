import { apiClient } from '@/services/api/client';
import type { Card, CreateCardRequest, UpdateCardRequest } from '@/types';

export interface CardMinimalInfo {
  id: number;
  title: string;
  content: string;
}

export const cardsApi = {
  async getCards(boardId?: number, type?: string): Promise<Card[]> {
    const params: Record<string, string | number> = {};
    if (boardId) params.boardId = boardId;
    if (type) params.type = type;
    const response = await apiClient.get('/card', { params });
    return response.data;
  },

  async getCard(cardId: number): Promise<Card> {
    const response = await apiClient.get(`/card/${cardId}`);
    return response.data;
  },

  async createCard(card: CreateCardRequest): Promise<Card> {
    const response = await apiClient.post('/card', card);
    return response.data;
  },

  async updateCard(cardId: number, card: UpdateCardRequest): Promise<Card> {
    const response = await apiClient.put(`/card/${cardId}`, card);
    return response.data;
  },

  async deleteCard(cardId: number): Promise<void> {
    await apiClient.delete(`/card/${cardId}`);
  },

  async getCardsMinimal(cardIds: number[]): Promise<CardMinimalInfo[]> {
    if (cardIds.length === 0) return [];
    const response = await apiClient.post('/card/batch-minimal', {
      card_ids: cardIds,
    });
    return response.data.cards;
  },
};

import { apiClient } from '@/services/api/client';
import type {
  Board,
  CreateBoardRequest,
  UpdateBoardRequest,
  BoardFullData,
  BatchUpdateCardPositionsRequest,
} from '@/types';

export const boardApi = {
  async getBoards(section?: 'portfolio' | 'strategy'): Promise<Board[]> {
    const response = await apiClient.get('/board', {
      params: section ? { section } : undefined,
    });
    return response.data;
  },

  async getHomeBoard(): Promise<Board> {
    const response = await apiClient.get('/board/home');
    return response.data;
  },

  async getBoard(boardId: number): Promise<Board> {
    const response = await apiClient.get(`/board/${boardId}`);
    return response.data;
  },

  async getBoardFull(boardId: number): Promise<BoardFullData> {
    const response = await apiClient.get(`/board/${boardId}/full`);
    return response.data;
  },

  async createBoard(board: CreateBoardRequest): Promise<Board> {
    const response = await apiClient.post('/board', board);
    return response.data;
  },

  async updateBoard(
    boardId: number,
    board: UpdateBoardRequest
  ): Promise<Board> {
    const response = await apiClient.put(`/board/${boardId}`, board);
    return response.data;
  },

  async deleteBoard(boardId: number): Promise<void> {
    await apiClient.delete(`/board/${boardId}`);
  },

  async duplicateBoard(boardId: number): Promise<Board> {
    const response = await apiClient.post(`/board/${boardId}/duplicate`);
    return response.data;
  },

  async batchUpdateCardPositions(
    boardId: number,
    updates: BatchUpdateCardPositionsRequest
  ): Promise<void> {
    await apiClient.put(`/board/${boardId}/card/position`, updates);
  },
};

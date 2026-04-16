import axios from 'axios';

const base =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : 'http://127.0.0.1:1/api';

export const apiClient = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const CURRENT_BOARD_KEY = 'current_board_id';

export const currentBoard = {
  getId(): number | null {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(CURRENT_BOARD_KEY);
    return v ? Number(v) : null;
  },
  setId(id: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_BOARD_KEY, String(id));
    }
  },
};

export async function ensureBoardInitialized(): Promise<number> {
  const boardId = currentBoard.getId();
  if (boardId) return boardId;
  return 1;
}

export const API_BASE_URL_EXPORT = String(apiClient.defaults.baseURL ?? '');

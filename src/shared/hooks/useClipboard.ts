import { useState, useCallback } from 'react';
import { Card } from '@/types';
import { Edge } from '@xyflow/react';

export const useClipboard = () => {
  const [clipboard, setClipboard] = useState<Card[]>([]);
  const [clipboardEdges, setClipboardEdges] = useState<Edge[]>([]);
  const [clipboardMode, setClipboardMode] = useState<'copy' | 'cut'>('copy');
  const [pasteCount, setPasteCount] = useState<number>(0);

  // Копирование карточек и их соединений
  const copyCards = useCallback((cards: Card[], edges: Edge[]) => {
    setClipboard(cards);
    setClipboardEdges(edges);
    setClipboardMode('copy');
    setPasteCount(0); // Сбрасываем счетчик при новом копировании
  }, []);

  // Вырезание карточек и их соединений
  const cutCards = useCallback((cards: Card[], edges: Edge[]) => {
    setClipboard(cards);
    setClipboardEdges(edges);
    setClipboardMode('cut');
    setPasteCount(0); // Сбрасываем счетчик при новом вырезании
  }, []);

  // Очистка буфера обмена
  const clearClipboard = useCallback(() => {
    setClipboard([]);
    setClipboardEdges([]);
    setClipboardMode('copy');
  }, []);

  // Увеличение счетчика вставок
  const incrementPasteCount = useCallback(() => {
    setPasteCount((prev) => prev + 1);
  }, []);

  return {
    clipboard,
    clipboardEdges,
    clipboardMode,
    pasteCount,
    copyCards,
    cutCards,
    clearClipboard,
    incrementPasteCount,
  };
};

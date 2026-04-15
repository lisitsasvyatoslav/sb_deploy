import type { NewsItem } from 'finsignal-feed-explore';
import { getTickerColor } from '@/shared/ui/TickerIcon';

export type RawEntity = { name?: string; type?: string; ticker?: string };

export const extractEntities = (item: NewsItem): RawEntity[] => {
  const raw = item as NewsItem & {
    metadata?: {
      preprocessing?: {
        results?: {
          ai_annotation?: { annotations?: { entities?: RawEntity[] } };
        };
      };
    };
    preprocessing?: {
      ai_annotation?: { annotations?: { entities?: RawEntity[] } };
    };
  };
  return (
    raw.metadata?.preprocessing?.results?.ai_annotation?.annotations
      ?.entities ??
    raw.preprocessing?.ai_annotation?.annotations?.entities ??
    []
  );
};

export const getTickerSvgLogo = (symbol: string): string => {
  const color = getTickerColor(symbol);
  const letter = symbol.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="${color}"/><text x="10" y="14.5" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="10" font-weight="600">${letter}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export type YmBoardType = 'portfolio' | 'space' | 'strategy';

export function ymBoardTypeFromTemplate(
  template: 'portfolio' | 'strategy' | undefined | null
): YmBoardType {
  if (template === 'portfolio') return 'portfolio';
  if (template === 'strategy') return 'strategy';
  return 'space';
}

export function ymBoardTypeFromPathname(pathname: string | null): YmBoardType {
  if (pathname?.startsWith('/portfolio/')) return 'portfolio';
  if (pathname?.startsWith('/strategies/')) return 'strategy';
  return 'space';
}

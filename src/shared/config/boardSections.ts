import type { YMGoal } from '@/shared/hooks';
import type { TranslateFn } from '@/shared/i18n/settings';

export interface BoardSectionConfig {
  title: string;
  createButtonLabel: string;
  createDialogTitle: string;
  createDialogNameLabel: string;
  createDialogNamePlaceholder: string;
  createDialogDescriptionLabel: string;
  createDialogDescriptionPlaceholder: string;
  detailRoute: (id: number) => string;
  viewportKey: string;
  previewImage: string;
  trackEventName: YMGoal;
  sectionFilter?: 'portfolio' | 'strategy';
}

export type BoardSectionKey = 'main' | 'portfolio' | 'strategy';

export const getBoardSectionConfigs = (
  t: TranslateFn
): Record<BoardSectionKey, BoardSectionConfig> => ({
  main: {
    title: t('boardSections.main.title'),
    createButtonLabel: t('boardSections.main.createButtonLabel'),
    createDialogTitle: t('boardSections.main.createDialogTitle'),
    createDialogNameLabel: t('boardSections.main.createDialogNameLabel'),
    createDialogNamePlaceholder: t(
      'boardSections.main.createDialogNamePlaceholder'
    ),
    createDialogDescriptionLabel: t(
      'boardSections.main.createDialogDescriptionLabel'
    ),
    createDialogDescriptionPlaceholder: t(
      'boardSections.main.createDialogDescriptionPlaceholder'
    ),
    detailRoute: (id) => `/ideas/${id}`,
    viewportKey: 'ideas-flow-viewport',
    previewImage: '/images/mocks/board-preview.png',
    trackEventName: 'board_create',
  },
  portfolio: {
    title: t('boardSections.portfolio.title'),
    sectionFilter: 'portfolio' as const,
    createButtonLabel: t('boardSections.portfolio.createButtonLabel'),
    createDialogTitle: t('boardSections.portfolio.createDialogTitle'),
    createDialogNameLabel: t('boardSections.portfolio.createDialogNameLabel'),
    createDialogNamePlaceholder: t(
      'boardSections.portfolio.createDialogNamePlaceholder'
    ),
    createDialogDescriptionLabel: t(
      'boardSections.portfolio.createDialogDescriptionLabel'
    ),
    createDialogDescriptionPlaceholder: t(
      'boardSections.portfolio.createDialogDescriptionPlaceholder'
    ),
    detailRoute: (id) => `/portfolio/${id}`,
    viewportKey: 'portfolios-flow-viewport',
    previewImage: '/images/mocks/portfolio-preview.png',
    trackEventName: 'portfolio_create',
  },
  strategy: {
    title: t('boardSections.strategy.title'),
    sectionFilter: 'strategy' as const,
    createButtonLabel: t('boardSections.strategy.createButtonLabel'),
    createDialogTitle: t('boardSections.strategy.createDialogTitle'),
    createDialogNameLabel: t('boardSections.strategy.createDialogNameLabel'),
    createDialogNamePlaceholder: t(
      'boardSections.strategy.createDialogNamePlaceholder'
    ),
    createDialogDescriptionLabel: t(
      'boardSections.strategy.createDialogDescriptionLabel'
    ),
    createDialogDescriptionPlaceholder: t(
      'boardSections.strategy.createDialogDescriptionPlaceholder'
    ),
    detailRoute: (id) => `/strategies/${id}`,
    viewportKey: 'strategies-flow-viewport',
    previewImage: '/images/mocks/board-preview.png',
    trackEventName: 'strategy_create',
  },
});

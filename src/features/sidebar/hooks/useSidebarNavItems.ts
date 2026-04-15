'use client';

import { useMemo } from 'react';
import { useBoardsAllQuery } from '@/features/board/queries';
import { useBrokerConnectionsQuery } from '@/features/broker/queries';
import { type IconVariant } from '@/shared/ui/Icon';
import { type SidebarSection } from '@/stores/sidebarStore';
import { useTranslation } from '@/shared/i18n/client';

const STRATEGIES_CATALOG_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_STRATEGIES_CATALOG === 'true';

export interface NavItem {
  id: string;
  path: string;
  label: string;
  iconVariant: IconVariant;
  section: SidebarSection | null;
  showCreateBoard?: boolean;
}

export interface SubItem {
  id: number;
  label: string;
  path: string;
}

export function useSidebarNavItems(isDemo: boolean) {
  const { t } = useTranslation('common');

  const { data: boards } = useBoardsAllQuery({ enabled: !isDemo });
  const { data: portfolioBoards } = useBoardsAllQuery({
    enabled: !isDemo,
    section: 'portfolio',
  });
  const { data: strategyBoards } = useBoardsAllQuery({
    enabled: !isDemo,
    section: 'strategy',
  });

  const { data: brokerConnections } = useBrokerConnectionsQuery({
    enabled: !isDemo,
  });
  const hasBrokerConnections =
    isDemo || (brokerConnections && brokerConnections.length > 0);

  const navItems = useMemo((): NavItem[] => {
    if (isDemo) {
      return [
        {
          id: 'boards',
          path: '/',
          label: t('nav.boards'),
          iconVariant: 'editNote',
          section: 'boards',
          showCreateBoard: true,
        },
      ];
    }
    return [
      {
        id: 'boards',
        path: '/',
        label: t('nav.boards'),
        iconVariant: 'editNote',
        section: 'boards',
        showCreateBoard: true,
      },
      {
        id: 'portfolios',
        path: '/portfolio',
        label: t('nav.portfolios'),
        iconVariant: 'chartPie',
        section: 'portfolios',
      },
      {
        id: 'strategies',
        path: '/strategies',
        label: t('nav.strategies'),
        iconVariant: 'target',
        section: 'strategies',
      },
      ...(STRATEGIES_CATALOG_ENABLED
        ? [
            {
              id: 'strategies-catalog',
              path: '/strategies-catalog',
              label: t('nav.strategiesCatalog'),
              iconVariant: 'targetWithArrow' as IconVariant,
              section: null,
            },
          ]
        : []),
    ];
  }, [isDemo, t]);

  const submenuItemsMap = useMemo(() => {
    const map: Record<string, SubItem[]> = {
      boards:
        boards?.map((b) => ({
          id: b.id,
          label: b.name,
          path: `/ideas/${b.id}`,
        })) || [],
      portfolios:
        portfolioBoards?.map((b) => ({
          id: b.id,
          label: b.name,
          path: `/portfolio/${b.id}`,
        })) || [],
      strategies:
        strategyBoards?.map((b) => ({
          id: b.id,
          label: b.name,
          path: `/strategies/${b.id}`,
        })) || [],
    };
    return map;
  }, [boards, portfolioBoards, strategyBoards]);

  return {
    navItems,
    submenuItemsMap,
    hasBrokerConnections: !!hasBrokerConnections,
  };
}

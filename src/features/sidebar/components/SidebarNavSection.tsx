'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { useSidebarStore, type SidebarSection } from '@/stores/sidebarStore';
import {
  SidebarNavItem,
  SidebarNavSubitem,
  SidebarNavGroup,
} from '@/shared/ui/SidebarNav';
import IconButton from '@/shared/ui/IconButton';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';
import { useSidebarContext } from './SidebarContext';
import {
  type NavItem,
  type SubItem,
} from '@/features/sidebar/hooks/useSidebarNavItems';

/* ── Per-item renderer ── */

interface NavItemRendererProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  isHovered: boolean;
  submenuItems: SubItem[];
  pathname: string | null;
  hasBrokerConnections: boolean;
  onItemClick: (item: NavItem) => void;
  onToggleExpand: (section: SidebarSection) => void;
  onSubitemClick: (path: string) => void;
  onCreateBoard: () => void;
  onHover: (id: string | null) => void;
}

const NavItemRenderer: React.FC<NavItemRendererProps> = ({
  item,
  isActive,
  isExpanded,
  isHovered,
  submenuItems,
  pathname,
  hasBrokerConnections,
  onItemClick,
  onToggleExpand,
  onSubitemClick,
  onCreateBoard,
  onHover,
}) => {
  const { isDemo, isCollapsed } = useSidebarContext();
  const { t } = useTranslation('common');
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const createBoardGlow = useGlowTarget(['create-board', 'board-or-create']);
  const hasSubmenu = submenuItems.length > 0;
  const isPortfolioNoBrokers =
    item.id === 'portfolios' && !hasBrokerConnections;
  const showCreateButton =
    !isDemo &&
    item.showCreateBoard &&
    (isHovered || isExpanded || createBoardGlow);

  const createButton = showCreateButton ? (
    <GlowBorder active={createBoardGlow} borderRadius={4} borderWidth={3}>
      <IconButton
        icon="plusSmall"
        size="sm"
        className="text-current"
        onClick={(e) => {
          e.stopPropagation();
          onCreateBoard();
        }}
        ariaLabel={t('mainPage.createBoard')}
      />
    </GlowBorder>
  ) : undefined;

  const renderExpandableGroup = () => (
    <SidebarNavGroup
      item={{
        icon: item.iconVariant,
        label: item.label,
        isHighlighted:
          isDemo ||
          (isActive &&
            !(isExpanded && submenuItems.some((sub) => pathname === sub.path))),
        rightArea: createButton,
      }}
      isCollapsed={isCollapsed}
      tooltip={item.label}
      isExpanded={isExpanded}
      onToggle={() => onItemClick(item)}
      onToggleExpand={() => {
        if (item.section) onToggleExpand(item.section);
      }}
    >
      {hasSubmenu && (
        <div className="flex flex-col overflow-y-auto min-h-0">
          {submenuItems.map((subitem) => (
            <SidebarNavSubitem
              key={subitem.id}
              label={subitem.label}
              isActive={pathname === subitem.path}
              onClick={() => onSubitemClick(subitem.path)}
            />
          ))}
        </div>
      )}
    </SidebarNavGroup>
  );

  const renderPlainItem = () => (
    <SidebarNavItem
      icon={item.iconVariant}
      label={item.label}
      isActive={isActive}
      isCollapsed={isCollapsed}
      tooltip={item.label}
      onClick={() => onItemClick(item)}
      rightArea={createButton}
    />
  );

  const renderPortfolioNoBrokersExpanded = () => (
    <>
      <SidebarNavItem
        icon="chartPie"
        label={item.label}
        isActive={isActive}
        isCollapsed={false}
        tooltip={item.label}
        onClick={() => onItemClick(item)}
      />
      <div className="flex flex-col items-center gap-spacing-10 pb-spacing-10">
        <span className="text-10 leading-12 tracking-tight-1 text-brand-base w-[170px]">
          {t('sidebar.connectBrokerHint')}
        </span>
        <Button
          variant="accent"
          size="xs"
          fullWidth
          className="w-[170px]"
          onClick={() => setShowBrokerDialog(true)}
        >
          {t('sidebar.connectBroker')}
        </Button>
      </div>
    </>
  );

  const renderContent = () => {
    if (isPortfolioNoBrokers) {
      if (isCollapsed) {
        return (
          <SidebarNavItem
            icon="plusSmall"
            label={item.label}
            isActive={false}
            isCollapsed
            tooltip={item.label}
            onClick={() => setShowBrokerDialog(true)}
          />
        );
      }
      return renderPortfolioNoBrokersExpanded();
    }
    if (hasSubmenu || isDemo) return renderExpandableGroup();
    return renderPlainItem();
  };

  const isPortfolioNavGlowTarget = useGlowTarget('portfolio-nav');
  const portfolioNavGlow = isPortfolioNavGlowTarget && item.id === 'portfolios';

  return (
    <div
      className={cn(
        'flex flex-col',
        !isCollapsed && 'overflow-hidden',
        isExpanded ? 'min-h-0' : 'flex-shrink-0'
      )}
    >
      <GlowBorder
        active={portfolioNavGlow}
        borderRadius={4}
        borderWidth={3}
        className="flex flex-col min-h-0"
      >
        <div
          className={cn(
            'relative flex flex-col min-h-0',
            !isCollapsed && 'overflow-hidden'
          )}
          onMouseEnter={() => onHover(item.id)}
          onMouseLeave={() => onHover(null)}
        >
          {renderContent()}
        </div>
      </GlowBorder>
    </div>
  );
};

/* ── Section ── */

interface SidebarNavSectionProps {
  navItems: NavItem[];
  submenuItemsMap: Record<string, SubItem[]>;
  hasBrokerConnections: boolean;
  onCreateBoard: () => void;
}

const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({
  navItems,
  submenuItemsMap,
  hasBrokerConnections,
  onCreateBoard,
}) => {
  const { isDemo, isCollapsed } = useSidebarContext();
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const { expandedSection, toggleSection, setExpandedSection } =
    useSidebarStore();
  const router = useRouter();

  // hoveredItem is local — does not belong in shared SidebarContext
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Ref to read expandedSection without making the auto-expand effect reactive on it.
  // Without this, toggling a section closed via chevron would immediately re-open it
  // when the current pathname matches that section (feedback loop).
  const expandedSectionRef = useRef(expandedSection);
  expandedSectionRef.current = expandedSection;

  // Auto-expand section matching current pathname (direct URL, refresh, or navigation)
  useEffect(() => {
    if (isDemo || isCollapsed) return;

    for (const item of navItems) {
      if (!item.section) continue;
      const subitems = submenuItemsMap[item.section] || [];
      const matchesItem =
        pathname === item.path || pathname?.startsWith(item.path + '/');
      const matchesSubitem = subitems.some((sub) => pathname === sub.path);

      if (matchesItem || matchesSubitem) {
        if (expandedSectionRef.current !== item.section) {
          setExpandedSection(item.section);
        }
        return;
      }
    }
  }, [
    pathname,
    navItems,
    submenuItemsMap,
    isDemo,
    isCollapsed,
    setExpandedSection,
  ]);

  const handleNavItemClick = useCallback(
    (item: NavItem) => {
      if (isDemo) return;

      const isExactMatch = pathname === item.path;

      if (isCollapsed) {
        if (!isExactMatch) {
          router.push(item.path);
        }
        return;
      }

      if (item.section) {
        if (expandedSection !== item.section) {
          setExpandedSection(item.section);
        }
        if (!isExactMatch) {
          router.push(item.path);
        }
        return;
      }

      router.push(item.path);
    },
    [isDemo, isCollapsed, pathname, router, expandedSection, setExpandedSection]
  );

  const handleSubitemClick = useCallback(
    (path: string) => {
      if (!isDemo) router.push(path);
    },
    [isDemo, router]
  );

  const renderedItems = useMemo(
    () =>
      navItems.map((item) => {
        const submenuItems =
          (item.section && submenuItemsMap[item.section]) || [];

        const isActive =
          !isDemo &&
          (pathname === item.path ||
            pathname?.startsWith(item.path + '/') ||
            submenuItems.some((sub) => pathname === sub.path));

        const isExpanded = isDemo
          ? !isCollapsed
          : item.section !== null &&
            expandedSection === item.section &&
            !isCollapsed;

        return (
          <NavItemRenderer
            key={item.id}
            item={item}
            isActive={isActive}
            isExpanded={isExpanded}
            isHovered={hoveredItem === item.id}
            submenuItems={submenuItems}
            pathname={pathname}
            hasBrokerConnections={hasBrokerConnections}
            onItemClick={handleNavItemClick}
            onToggleExpand={toggleSection}
            onSubitemClick={handleSubitemClick}
            onCreateBoard={onCreateBoard}
            onHover={setHoveredItem}
          />
        );
      }),
    [
      navItems,
      submenuItemsMap,
      isDemo,
      isCollapsed,
      expandedSection,
      hoveredItem,
      pathname,
      hasBrokerConnections,
      handleNavItemClick,
      toggleSection,
      handleSubitemClick,
      onCreateBoard,
    ]
  );

  return (
    <nav
      aria-label={t('sidebar.mainNavigation')}
      className="flex flex-col gap-spacing-2 min-h-0 overflow-hidden"
    >
      {renderedItems}
    </nav>
  );
};

export default React.memo(SidebarNavSection);

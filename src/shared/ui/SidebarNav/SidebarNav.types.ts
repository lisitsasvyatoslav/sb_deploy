import { type IconVariant } from '@/shared/ui/Icon';

/**
 * Sidebar/Item/Main/Default — Figma node: 55156:8045
 * Sidebar/Item/Main/Mini — Figma node: 55173:2426
 * Sidebar/Subitem/Main/Default — Figma node: 55308:5705
 * Sidebar/Items — Figma node: 55302:11212
 */

export interface SidebarNavItemProps {
  /** Left icon — IconVariant string or custom ReactNode (e.g. Avatar) */
  icon?: IconVariant | React.ReactNode;
  /** Label text */
  label: string;
  /** Show/hide left icon. Default: true */
  showIcon?: boolean;
  /** Custom right area content */
  rightArea?: React.ReactNode;
  /** Controls chevron direction (right → down) */
  isExpanded?: boolean;
  /** Show expand/collapse chevron. Default: false */
  showChevron?: boolean;
  /** Active state (accent text, no background) */
  isActive?: boolean;
  /** Highlighted state (accent background + accent text, e.g. expanded group) */
  isHighlighted?: boolean;
  /** Collapsed mode — render icon only, like SidebarNavItemMini */
  isCollapsed?: boolean;
  /** Tooltip text shown on hover when collapsed */
  tooltip?: string;
  /** Click handler */
  onClick?: () => void;
  /** Toggle expand/collapse handler for chevron */
  onToggleExpand?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface SidebarNavSubitemProps {
  /** Label text */
  label: string;
  /** Right area content (visible on hover via group-hover) */
  rightArea?: React.ReactNode;
  /** Active state */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface SidebarNavGroupProps {
  /** Main item props (isExpanded, showChevron, isCollapsed, tooltip are managed internally) */
  item: Omit<
    SidebarNavItemProps,
    'isExpanded' | 'showChevron' | 'isCollapsed' | 'tooltip'
  >;
  /** Sub-items to render when expanded */
  children?: React.ReactNode;
  /** Controlled expand state */
  isExpanded?: boolean;
  /** Collapsed mode — render icon only, hide children */
  isCollapsed?: boolean;
  /** Tooltip text shown on hover when collapsed */
  tooltip?: string;
  /** Toggle expand/collapse callback */
  onToggle?: () => void;
  /** Toggle expand/collapse handler for chevron only */
  onToggleExpand?: () => void;
  className?: string;
  'data-testid'?: string;
}

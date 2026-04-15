import React from 'react';

export type ListItemAppState = 'enabled' | 'focused' | 'active' | 'disabled';

export type DropdownPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface ListItemAppProps {
  /** Leading visual element (Avatar, BaseImage, Icon) */
  leading?: React.ReactNode;
  /** Primary text */
  title: string;
  /** Secondary text below title (string or ReactNode for custom layouts) */
  caption?: React.ReactNode;
  /** Trailing controls (Checkbox, RadioButton, Switch, IconButton, etc.) */
  trailing?: React.ReactNode;
  /** Visual state. Default: 'enabled' */
  state?: ListItemAppState;
  /** Click handler */
  onClick?: () => void;
  /** Dropdown menu content. When provided, ListItemApp becomes a dropdown trigger. */
  dropdownMenu?: React.ReactNode;
  /** CSS classes for dropdown menu container */
  dropdownMenuClassName?: string;
  /** Dropdown placement. Default: 'bottom' */
  dropdownPlacement?: DropdownPlacement;
  /** Match trigger width for dropdown menu */
  dropdownMatchTriggerWidth?: boolean;
  className?: string;
  'data-testid'?: string;
}

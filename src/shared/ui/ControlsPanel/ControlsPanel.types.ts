import type React from 'react';
import type { ButtonProps } from '@/shared/ui/Button/Button.types';
import type { IconButtonProps } from '@/shared/ui/IconButton';
import type { DropdownItem } from '@/shared/ui/Dropdown/DropdownItemButton';
import type { DropdownPlacement } from '@/shared/ui/Dropdown/Dropdown.types';

export type DropdownConfig = {
  items: DropdownItem[];
  placement?: DropdownPlacement;
  selectedValue?: string;
  onSelect?: (value: string) => void;
  header?: React.ReactNode;
};

export type ControlsButtonItem = ButtonProps & {
  kind?: 'button';
  id?: string;
  dropdown?: DropdownConfig;
};

export type ControlsIconButtonItem = IconButtonProps & {
  kind: 'icon-button';
  id?: string;
  dropdown?: DropdownConfig;
};

export type ControlsCustomItem = {
  kind: 'custom';
  id?: string;
  content: React.ReactNode;
};

export type ControlsItem =
  | 'divider'
  | ControlsButtonItem
  | ControlsIconButtonItem
  | ControlsCustomItem;

export interface ControlsPanelProps {
  items: ControlsItem[];
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

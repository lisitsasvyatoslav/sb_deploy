import React from 'react';
import { IconVariant } from '@/shared/ui/Icon/Icon.types';

export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type ButtonVariant =
  | 'accent'
  | 'primary'
  | 'negative'
  | 'secondary'
  | 'ghost';
export type IconSide = 'left' | 'right';
export type ButtonIcon = IconVariant | React.ReactElement;

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  iconSide?: IconSide;
  icon?: ButtonIcon;
  iconRight?: ButtonIcon;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
  'aria-label'?: string;
  // Anchor props - when href is provided, renders as <a> instead of <button>
  href?: string;
  target?: string;
  rel?: string;
}

export interface LogoProps {
  /** Icon-only collapsed mode. Default: false (full logo). */
  isCollapsed?: boolean;
  className?: string;
}

export type FinamProductVariant =
  | 'finam-diary'
  | 'finam-dnevnik'
  | 'finam-space';

export interface FinamProductLogoProps {
  variant: FinamProductVariant;
  /** Icon-only collapsed mode. Default: false (full logo). */
  isCollapsed?: boolean;
  className?: string;
}

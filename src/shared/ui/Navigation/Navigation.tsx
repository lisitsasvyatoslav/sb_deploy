'use client';

import NextLink from 'next/link';

interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  to: string;
  replace?: boolean;
  children: React.ReactNode;
}

export function Link({ to, replace, children, ...props }: LinkProps) {
  return (
    <NextLink href={to} replace={replace} {...props}>
      {children}
    </NextLink>
  );
}

interface NavigateProps {
  to: string;
  replace?: boolean;
}

export function Navigate({ to, replace = false }: NavigateProps) {
  // Synchronous redirect to prevent UI flicker
  if (typeof window !== 'undefined') {
    replace ? window.location.replace(to) : (window.location.href = to);
  }
  return null;
}

interface OutletProps {
  children?: React.ReactNode;
}

export function Outlet({ children }: OutletProps) {
  return <>{children}</>;
}

'use client';

import { ReactNode } from 'react';
import { useDevStrategyCatalog } from '@/shared/hooks/useDevStrategyCatalog';

export default function StrategiesCatalogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isDevCatalogEnabled = useDevStrategyCatalog();

  if (!isDevCatalogEnabled) {
    return null;
  }

  return <>{children}</>;
}

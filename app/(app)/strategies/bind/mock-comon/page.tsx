'use client';

import { Suspense } from 'react';
import MockComonPage from '@/features/strategy-binding/components/MockComonPage';

// TODO [MOCK]: Remove this page entirely after integration with the real comon.ru.
// In the real flow the user is redirected to comon.ru, not to this mock page.

export default function MockComonRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <MockComonPage />
    </Suspense>
  );
}

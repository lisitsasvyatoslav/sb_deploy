'use client';

import { Suspense } from 'react';
import StrategyBindingCallback from '@/features/strategy-binding/components/StrategyBindingCallback';

export default function StrategyBindingCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
        </div>
      }
    >
      <StrategyBindingCallback />
    </Suspense>
  );
}

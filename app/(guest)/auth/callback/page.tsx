'use client';

import { Suspense } from 'react';
import OAuthCallback from '@/features/auth/components/OAuthCallback';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-base p-5">
      <div className="max-w-[400px] w-full p-10 bg-white rounded-xl shadow-lg text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full mx-auto mb-5 animate-spin" />
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Загрузка...
        </h2>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OAuthCallback />
    </Suspense>
  );
}

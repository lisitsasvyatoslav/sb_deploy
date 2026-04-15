'use client';

import { Suspense } from 'react';
import ResetPassword from '@/features/auth/components/ResetPassword';

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full mx-auto mb-5 animate-spin" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 text-center">
            Загрузка...
          </h2>
        </div>
      </div>
      <div className="flex-1 auth-intro-bg bg-[url(/intro.png)] bg-center bg-cover bg-no-repeat" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPassword />
    </Suspense>
  );
}

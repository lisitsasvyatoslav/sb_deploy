'use client';

import WelcomeAuthModal from '@/features/auth/components/WelcomeAuthModal';

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-base">
      {children}
      <WelcomeAuthModal />
    </div>
  );
}

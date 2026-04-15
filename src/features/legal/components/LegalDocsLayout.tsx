'use client';

import LegalDocsSidebar from '@/features/legal/components/LegalDocsSidebar';

interface LegalDocsLayoutProps {
  children: React.ReactNode;
}

export default function LegalDocsLayout({ children }: LegalDocsLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <LegalDocsSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

'use client';

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { WELCOME_STORAGE_KEYS } from '../constants';
import { useDemoNoteStore } from '@/stores/demoNoteStore';
import { useDemoChatStore } from '@/stores/demoChatStore';
import Sidebar from '@/features/sidebar';
import DemoChat from './DemoChat';

const DemoBoard = lazy(() => import('./DemoBoard'));

const DemoScene: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.removeItem(WELCOME_STORAGE_KEYS.DEMO_SPARKLE_CONTEXT);
      } catch {
        // ignore
      }
      useDemoNoteStore.getState().reset();
      useDemoChatStore.getState().reset();
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      useDemoNoteStore.getState().reset();
    };
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        mode="demo"
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <DemoChat isOpen={isChatOpen} />
      <div className="flex-1 overflow-hidden bg-[var(--bg-base)]">
        <Suspense
          fallback={
            <div className="h-full animate-pulse bg-[var(--bg-base)] rounded" />
          }
        >
          <DemoBoard />
        </Suspense>
      </div>
    </div>
  );
};

export default DemoScene;

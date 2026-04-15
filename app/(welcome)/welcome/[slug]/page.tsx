'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDemoChatStore } from '@/stores/demoChatStore';
import { useDemoNoteStore } from '@/stores/demoNoteStore';
import { getSlugConfig } from '@/features/welcome/constants';
import DemoScene from '@/features/welcome/components/DemoScene';

export default function WelcomeSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const slugConfig = getSlugConfig(slug);
  const seededSlug = useRef<string | null>(null);

  // Reset and seed SYNCHRONOUSLY before children render/mount their effects
  if (slugConfig && !isAuthenticated && seededSlug.current !== slug) {
    seededSlug.current = slug;
    useDemoChatStore.getState().reset();
    useDemoNoteStore.getState().reset();
    useDemoChatStore.getState().setInitialQuestion(slugConfig.text);
  }

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
      return;
    }
    if (!slugConfig) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, slugConfig, router]);

  if (!slugConfig) return null;

  return <DemoScene key={slug} />;
}

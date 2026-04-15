'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAuthModalStore } from '@/stores/authModalStore';
import { useDemoChatStore } from '@/stores/demoChatStore';
import { WELCOME_STORAGE_KEYS } from '@/features/welcome/constants';
import DiaryLogoButton from '@/shared/ui/DiaryLogoButton';
import Button from '@/shared/ui/Button';
import WelcomeForm from '@/features/welcome/components/WelcomeForm';
import DemoScene from '@/features/welcome/components/DemoScene';

type PageState = 'welcome' | 'demo';

export default function WelcomePage() {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialState =
    searchParams?.get('demo') === 'true' ? 'demo' : 'welcome';
  const [pageState, setPageState] = useState<PageState>(initialState);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleQuestionSubmit = useCallback(
    (question: string, sparklyId: string) => {
      useDemoChatStore.getState().reset();
      useDemoChatStore.getState().setInitialQuestion(question);
      try {
        if (sparklyId) {
          localStorage.setItem(
            WELCOME_STORAGE_KEYS.DEMO_SPARKLE_CONTEXT,
            sparklyId
          );
        }
      } catch {
        // ignore localStorage errors
      }
      setPageState('demo');
      router.replace('/welcome?demo=true', { scroll: false });
    },
    [router]
  );

  if (pageState === 'demo') {
    return <DemoScene />;
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Ellipse BG — large purple gradient glow at the top */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[-688px] w-[1392px] h-[1109px] overflow-visible">
        <svg
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          overflow="visible"
          style={{ display: 'block' }}
          viewBox="0 0 1392 1109"
          fill="none"
        >
          <ellipse
            cx="696"
            cy="554.5"
            rx="696"
            ry="554.5"
            fill="url(#ellipseBgGradLarge)"
            fillOpacity="0.4"
          />
          <defs>
            <radialGradient
              id="ellipseBgGradLarge"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(696 554.5) rotate(90) scale(554.5 696)"
            >
              <stop style={{ stopColor: 'var(--color-accent)' }} />
              <stop
                offset="1"
                style={{
                  stopColor: 'var(--welcome-ellipse-fade)',
                  stopOpacity: 0,
                }}
              />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Dots — diamond dot pattern */}
      <div className="pointer-events-none absolute left-[-179px] top-[167px] w-[1432px] h-[890px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/welcome/dots.svg" alt="" className="w-full h-full" />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 z-50 bg-transparent">
        <div className="flex items-center justify-between gap-4 px-4 pt-[15px]">
          <div className="flex items-center flex-shrink-0">
            <DiaryLogoButton variant="bare" />
          </div>
          <div className="flex items-center flex-shrink-0">
            <Button
              type="button"
              onClick={() => openModal('login')}
              variant="secondary"
              size="md"
              className="!text-blackinverse-a56 !rounded-[2px] !px-3 !py-2 !text-[16px] !font-semibold !leading-6 !tracking-[-0.4px]"
            >
              Войти
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 min-h-0">
        <WelcomeForm
          sparklyId={searchParams?.get('sparklyId') ?? ''}
          onSubmit={handleQuestionSubmit}
        />
      </main>
    </div>
  );
}

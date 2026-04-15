'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { useChatStore } from '@/stores/chatStore';
import { useChatStoreHydrated } from '@/stores/useChatStoreHydrated';
import { useChatsQuery, useCreateChatMutation } from '@/features/chat/queries';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';

import { ONBOARDING_SCENES } from '../constants';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { useWidgetDrag } from '../hooks/useWidgetDrag';
import { useWidgetResize } from '../hooks/useWidgetResize';
import { useOnboardingUIStore } from '../stores/onboardingUIStore';
import {
  getStepKey,
  getNextHighlightTarget,
  isStepLocked,
  computeCompletedSteps,
} from '../utils/helpers';
import { OnboardingWidgetHeader } from './OnboardingWidgetHeader';
import { OnboardingStepItem } from './OnboardingStepItem';
import { OnboardingFooter } from './OnboardingFooter';

export const OnboardingWidget = () => {
  // Dynamic keys from constants.ts require a loosened `t` signature
  const { t } = useTranslation('chat') as {
    t: (key: string, opts?: Record<string, unknown>) => string;
  };
  const pathname = usePathname();

  const { isActive, dismiss, markSceneViewed } = useOnboardingProgress();
  const { trackEvent } = useYandexMetrika();

  const {
    closeGuide,
    widgetMode,
    widgetPosition,
    setWidgetPosition,
    widgetSize,
    activeSceneIndex,
    setActiveSceneIndex,
    checkedSteps,
    toggleStepCheck,
    setPendingChatMessage,
    setActiveHighlightTarget,
    awaitingReplyStepKey,
    setAwaitingReplyStepKey,
  } = useOnboardingUIStore();

  const openSidebar = useChatStore((s) => s.openSidebar);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const createChatMutation = useCreateChatMutation();
  const { data: chatList = [], isLoading: isChatsLoading } = useChatsQuery();

  const handleDragStart = useWidgetDrag();
  const handleResizeStart = useWidgetResize();

  // Open chat sidebar and ensure a chat exists for chat-focused scenes (ids 2, 3)
  const isChatScene = activeSceneIndex <= 1;
  const creatingChatRef = useRef(false);
  const chatStoreHydrated = useChatStoreHydrated();
  useEffect(() => {
    if (!isChatScene) return;
    openSidebar();
    // Wait for the chat store to finish rehydrating from localStorage and
    // the chat list to load before deciding whether to create a new chat.
    // Without these gates, the effect sees activeChatId=null (pre-hydration
    // or after closeAll() persisted null) and creates a duplicate.
    if (!chatStoreHydrated || isChatsLoading) return;
    // If chats already exist, ChatManager will select one — don't create a duplicate.
    if (chatList.length > 0) return;
    if (!activeChatId && !creatingChatRef.current) {
      creatingChatRef.current = true;
      createChatMutation
        .mutateAsync({ name: t('manager.newChat'), systemPromptId: 'default' })
        .then((chat) => {
          setActiveChatId(chat.id, chat.type || 'chat');
        })
        .catch(() => {})
        .finally(() => {
          creatingChatRef.current = false;
        });
    }
  }, [isChatScene, chatStoreHydrated, isChatsLoading, chatList.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize floating position to top-right
  useEffect(() => {
    if (
      widgetMode === 'floating' &&
      widgetPosition.x === 0 &&
      widgetPosition.y === 0
    ) {
      setWidgetPosition({
        x: Math.max(0, window.innerWidth - 400),
        y: 80,
      });
    }
  }, [widgetMode, widgetPosition, setWidgetPosition]);

  // Reactively highlight the next actionable step whenever any gating input changes
  useEffect(() => {
    const scene = ONBOARDING_SCENES[activeSceneIndex];
    if (!scene) return;
    const target = getNextHighlightTarget({
      scene,
      activeSceneIndex,
      checkedSteps,
      pathname,
    });
    setActiveHighlightTarget(target);
  }, [activeSceneIndex, checkedSteps, pathname, setActiveHighlightTarget]);

  // Clear stale awaiting state when the user navigates to a different scene.
  // The awaiting key is scene-scoped; leaving it set would block autoFill steps
  // in the new scene and could mark the wrong step when the reply arrives.
  const prevSceneRef = useRef(activeSceneIndex);
  useEffect(() => {
    if (prevSceneRef.current !== activeSceneIndex) {
      prevSceneRef.current = activeSceneIndex;
      if (awaitingReplyStepKey) setAwaitingReplyStepKey(null);
    }
  }, [activeSceneIndex, awaitingReplyStepKey, setAwaitingReplyStepKey]);

  // Fire onboarding_started once when the widget is displayed for an active onboarding
  const onboardingStartedFired = useRef(false);
  useEffect(() => {
    if (!isActive) {
      onboardingStartedFired.current = false;
      return;
    }
    if (!onboardingStartedFired.current) {
      onboardingStartedFired.current = true;
      trackEvent('onboarding_started', {
        started_time: new Date().toISOString(),
      });
    }
  }, [isActive, trackEvent]);

  const currentScene = ONBOARDING_SCENES[activeSceneIndex];
  const completedSteps = computeCompletedSteps(checkedSteps);

  const handleClose = useCallback(() => {
    if (isActive) {
      trackEvent('onboarding_failed', {
        failed_time: new Date().toISOString(),
        last_stage: `scene_${ONBOARDING_SCENES[activeSceneIndex]?.id ?? activeSceneIndex}`,
      });
      dismiss();
    }
    closeGuide();
  }, [isActive, dismiss, closeGuide, trackEvent, activeSceneIndex]);

  const handlePrevious = useCallback(() => {
    if (activeSceneIndex > 0) {
      setActiveSceneIndex(activeSceneIndex - 1);
    }
  }, [activeSceneIndex, setActiveSceneIndex]);

  const handleNext = useCallback(() => {
    const currentScene = ONBOARDING_SCENES[activeSceneIndex];
    markSceneViewed(currentScene.id);

    if (activeSceneIndex < ONBOARDING_SCENES.length - 1) {
      setActiveSceneIndex(activeSceneIndex + 1);
    } else {
      // Last scene: markSceneViewed(7) sets step=7 (completed).
      // Don't call dismiss() — that would race and set step=-1.
      trackEvent('onboarding_completed', {
        completed_time: new Date().toISOString(),
      });
      closeGuide();
    }
  }, [
    activeSceneIndex,
    markSceneViewed,
    setActiveSceneIndex,
    closeGuide,
    trackEvent,
  ]);

  // Resolve the active video: last checked step's video, or first step's (scene intro)
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeVideo = useMemo(() => {
    const steps = currentScene.steps;
    // Find the last checked step in this scene that has a video
    for (let i = steps.length - 1; i >= 0; i--) {
      if (
        checkedSteps[getStepKey(activeSceneIndex, i)] &&
        steps[i].shortcutVideo
      ) {
        return steps[i].shortcutVideo;
      }
    }
    // Default to first step's video (scene intro)
    return steps[0]?.shortcutVideo;
  }, [currentScene, activeSceneIndex, checkedSteps]);

  // Restart video when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeVideo]);

  const innerContent = (
    <>
      <OnboardingWidgetHeader
        title={t(currentScene.titleKey)}
        onClose={handleClose}
        onDragStart={handleDragStart}
      />

      {/* Shortcut video or fallback hero image */}
      <div className="aspect-video overflow-hidden relative shrink-0 w-full z-[2] mt-[48px] bg-black">
        {activeVideo ? (
          <video
            ref={videoRef}
            key={activeVideo}
            src={activeVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={currentScene.heroImage}
            alt={t(currentScene.titleKey)}
            fill
            className="object-cover"
            sizes="500px"
            priority={activeSceneIndex === 0}
          />
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto z-[1] pb-[84px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(4,4,5,0.08) transparent',
        }}
      >
        {currentScene.steps.map((stepItem, index) => {
          const locked = isStepLocked({
            sceneId: currentScene.id,
            stepIndex: index,
            pathname,
          });

          const isChecked = !!checkedSteps[getStepKey(activeSceneIndex, index)];

          const handleToggle = () => {
            if (stepItem.type === 'survey_link') openSidebar();

            // Steps with autoFillMessage are two-phase: fill input → send → wait for AI reply.
            // Defer the check until the AI reply arrives (ChatWindow calls completeAwaitingStep).
            // Allow unchecking after completion (same as non-autoFill steps).
            // Block new autoFill clicks while a previous one is still awaiting a reply.
            if (stepItem.autoFillMessage) {
              if (isChecked) {
                toggleStepCheck(activeSceneIndex, index);
                return;
              }
              if (awaitingReplyStepKey) return;
              setPendingChatMessage(stepItem.autoFillMessage);
              setAwaitingReplyStepKey(getStepKey(activeSceneIndex, index));
              for (let i = 0; i < index; i++) {
                if (!checkedSteps[getStepKey(activeSceneIndex, i)]) {
                  toggleStepCheck(activeSceneIndex, i);
                }
              }
              return;
            }

            // Non-autoFill steps: check immediately
            if (!isChecked) {
              for (let i = 0; i < index; i++) {
                if (!checkedSteps[getStepKey(activeSceneIndex, i)]) {
                  toggleStepCheck(activeSceneIndex, i);
                }
              }
            }
            toggleStepCheck(activeSceneIndex, index);
          };

          return (
            <OnboardingStepItem
              key={index}
              number={index + 1}
              text={t(stepItem.textKey)}
              isSurveyLink={stepItem.type === 'survey_link'}
              isChecked={isChecked}
              onToggle={handleToggle}
              locked={locked}
            />
          );
        })}
      </div>

      <OnboardingFooter
        activeSceneIndex={activeSceneIndex}
        completedSteps={completedSteps}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );

  if (widgetMode === 'docked') {
    return (
      <div className="relative flex flex-col h-full overflow-hidden border-l border-blackinverse-a0 backdrop-blur-[60px] bg-background-gray_low">
        {innerContent}
      </div>
    );
  }

  const resizeHandle = (edge: string, className: string) => (
    <div
      className={`absolute z-10 ${className}`}
      onMouseDown={(e) => handleResizeStart(e, edge)}
    />
  );

  return (
    <div
      className="fixed z-[1400] flex flex-col overflow-hidden rounded-[4px] shadow-[0px_16px_32px_-8px_rgba(4,4,5,0.08)] backdrop-blur-[40px] bg-background-gray_high border border-blackinverse-a4"
      style={{
        left: widgetPosition.x,
        top: widgetPosition.y,
        width: widgetSize.width,
        height: widgetSize.height,
      }}
    >
      {innerContent}
      {resizeHandle('top', 'top-0 left-2 right-2 h-1 cursor-ns-resize')}
      {resizeHandle('bottom', 'bottom-0 left-2 right-2 h-1 cursor-ns-resize')}
      {resizeHandle('left', 'left-0 top-2 bottom-2 w-1 cursor-ew-resize')}
      {resizeHandle('right', 'right-0 top-2 bottom-2 w-1 cursor-ew-resize')}
      {resizeHandle('top-left', 'top-0 left-0 w-3 h-3 cursor-nwse-resize')}
      {resizeHandle('top-right', 'top-0 right-0 w-3 h-3 cursor-nesw-resize')}
      {resizeHandle(
        'bottom-left',
        'bottom-0 left-0 w-3 h-3 cursor-nesw-resize'
      )}
      {resizeHandle(
        'bottom-right',
        'bottom-0 right-0 w-3 h-3 cursor-nwse-resize'
      )}
    </div>
  );
};

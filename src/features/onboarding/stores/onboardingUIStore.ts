import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WidgetMode } from '../types';

type OnboardingUIState = {
  isGuideOpen: boolean;
  widgetMode: WidgetMode;
  widgetPosition: { x: number; y: number };
  widgetSize: { width: number; height: number };
  dockedWidth: number;
  activeSceneIndex: number;

  /** Steps the user has checked off, keyed as "sceneIndex-stepIndex" */
  checkedSteps: Record<string, boolean>;
  /** Which UI element currently has the glow highlight (null = none) */
  activeHighlightTarget: string | null;
  /** Whether the required survey questions have been answered */
  surveyCompleted: boolean;

  /** Message to auto-fill into chat input (consumed by ChatWindow) */
  pendingChatMessage: string | null;
  /** Step key awaiting a chat reply before auto-checking (e.g. "2-0") */
  awaitingReplyStepKey: string | null;

  openGuide: () => void;
  closeGuide: () => void;
  toggleWidgetMode: () => void;
  setWidgetMode: (mode: WidgetMode) => void;
  setWidgetPosition: (pos: { x: number; y: number }) => void;
  setWidgetSize: (size: { width: number; height: number }) => void;
  setDockedWidth: (width: number) => void;
  setActiveSceneIndex: (index: number) => void;
  resetUIState: () => void;

  toggleStepCheck: (sceneIndex: number, stepIndex: number) => void;
  setActiveHighlightTarget: (target: string | null) => void;
  setSurveyCompleted: (completed: boolean) => void;
  setPendingChatMessage: (msg: string | null) => void;
  setAwaitingReplyStepKey: (key: string | null) => void;
  /** Replace the entire checkedSteps map (used for server reconciliation) */
  setCheckedSteps: (steps: Record<string, boolean>) => void;
  /** Mark the awaiting step as checked and clear the awaiting state */
  completeAwaitingStep: () => void;
  /** Reset only step-related state (preserves widget position/mode/size preferences) */
  resetStepState: () => void;
};

export const useOnboardingUIStore = create<OnboardingUIState>()(
  persist(
    (set) => ({
      isGuideOpen: false,
      widgetMode: 'docked',
      widgetPosition: { x: 0, y: 0 },
      widgetSize: { width: 360, height: 520 },
      dockedWidth: 500,
      activeSceneIndex: 0,
      checkedSteps: {},
      activeHighlightTarget: null,
      surveyCompleted: false,
      pendingChatMessage: null,
      awaitingReplyStepKey: null,

      openGuide: () => set({ isGuideOpen: true }),
      closeGuide: () =>
        set({
          isGuideOpen: false,
          activeHighlightTarget: null,
          pendingChatMessage: null,
          awaitingReplyStepKey: null,
        }),
      toggleWidgetMode: () =>
        set((s) => ({
          widgetMode: s.widgetMode === 'docked' ? 'floating' : 'docked',
        })),
      setWidgetMode: (mode) => set({ widgetMode: mode }),
      setWidgetPosition: (pos) => set({ widgetPosition: pos }),
      setWidgetSize: (size) => set({ widgetSize: size }),
      setDockedWidth: (width) => set({ dockedWidth: width }),
      setActiveSceneIndex: (index) => set({ activeSceneIndex: index }),
      resetUIState: () =>
        set({
          isGuideOpen: false,
          activeSceneIndex: 0,
          widgetMode: 'docked',
          checkedSteps: {},
          activeHighlightTarget: null,
          pendingChatMessage: null,
          awaitingReplyStepKey: null,
        }),

      toggleStepCheck: (sceneIndex, stepIndex) =>
        set((s) => {
          const key = `${sceneIndex}-${stepIndex}`;
          const next = { ...s.checkedSteps };
          if (next[key]) {
            delete next[key];
          } else {
            next[key] = true;
          }
          return { checkedSteps: next };
        }),

      setActiveHighlightTarget: (target) =>
        set({ activeHighlightTarget: target }),
      setSurveyCompleted: (completed) => set({ surveyCompleted: completed }),
      setPendingChatMessage: (msg) => set({ pendingChatMessage: msg }),
      setAwaitingReplyStepKey: (key) => set({ awaitingReplyStepKey: key }),
      setCheckedSteps: (steps) => set({ checkedSteps: steps }),

      completeAwaitingStep: () =>
        set((s) => {
          if (!s.awaitingReplyStepKey) return s;
          const next = { ...s.checkedSteps, [s.awaitingReplyStepKey]: true };
          return { checkedSteps: next, awaitingReplyStepKey: null };
        }),

      resetStepState: () =>
        set({
          isGuideOpen: false,
          activeSceneIndex: 0,
          checkedSteps: {},
          activeHighlightTarget: null,
          surveyCompleted: false,
          pendingChatMessage: null,
          awaitingReplyStepKey: null,
        }),
    }),
    {
      name: 'onboarding-ui',
      // Only per-device UI preferences are persisted to localStorage.
      // Progress fields (checkedSteps, activeSceneIndex, surveyCompleted)
      // are owned by the server and hydrated by useOnboardingProgressSync.
      partialize: (state) => ({
        isGuideOpen: state.isGuideOpen,
        widgetMode: state.widgetMode,
        widgetPosition: state.widgetPosition,
        widgetSize: state.widgetSize,
        dockedWidth: state.dockedWidth,
      }),
    }
  )
);

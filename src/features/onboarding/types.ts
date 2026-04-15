export type OnboardingProgress = {
  step: number;
  isDismissed: boolean;
  /** Map of completed steps keyed as "sceneIdx-stepIdx" → true */
  checkedSteps: Record<string, boolean>;
  /** Index of the scene currently displayed in the widget */
  activeSceneIndex: number;
  /** Whether the user has completed the required survey questions */
  surveyCompleted: boolean;
};

/** Partial-update payload sent to PATCH /api/onboarding/progress */
export type OnboardingProgressPatch = {
  checkedSteps?: Record<string, boolean>;
  activeSceneIndex?: number;
  surveyCompleted?: boolean;
};

export type OnboardingStepItem = {
  textKey: string;
  textFallback: string;
  type?: 'survey_link';
  /** Per-step highlight target (overrides scene-level highlightTarget) */
  highlightTarget?: string;
  /** When set, clicking the step auto-fills the chat input with this message */
  autoFillMessage?: string;
  /** Path to a short animation (.webm) illustrating this step */
  shortcutVideo?: string;
};

export type OnboardingScene = {
  id: number;
  titleKey: string;
  titleFallback: string;
  heroImage: string;
  steps: OnboardingStepItem[];
  nextLabelKey?: string;
  nextLabelFallback?: string;
  /** Which UI element to highlight with the glow border when a step is checked */
  highlightTarget?: string;
};

export type WidgetMode = 'floating' | 'docked';

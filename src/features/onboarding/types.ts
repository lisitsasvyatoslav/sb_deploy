export type OnboardingProgress = {
  step: number;
  isDismissed: boolean;
  checkedSteps: Record<string, boolean>;
  activeSceneIndex: number;
  surveyCompleted: boolean;
};

export type OnboardingProgressPatch = {
  checkedSteps?: Record<string, boolean>;
  activeSceneIndex?: number;
  surveyCompleted?: boolean;
};

export type OnboardingStepItem = {
  textKey: string;
  textFallback: string;
  type?: 'survey_link';
  highlightTarget?: string;
  autoFillMessage?: string;
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
  highlightTarget?: string;
};

export type WidgetMode = 'floating' | 'docked';

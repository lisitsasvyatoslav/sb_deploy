export type SurveyQuestionType = 'single_choice' | 'multiple_choice';

export interface SurveyAnswerOption {
  value: string;
  text: string;
  // scoring fields are optional and may vary by question
  [key: string]: unknown;
}

export interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: SurveyQuestionType | string;
  answerOptions?: SurveyAnswerOption[] | null;
  isRequired: boolean;
  displayOrder: number;
}

export interface SurveyStatusResponse {
  completed: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  remainingRequired: number;
  requiredAnswered?: Record<string, boolean>;
  nextQuestionId?: number | null;
}

export interface SurveyHistoryItem {
  questionText: string;
  answerTexts: string[];
}

export interface SurveyReminderStatus {
  isCompleted: boolean;
  messagesUntilReminder: number;
  shouldShowReminder: boolean;
  exists: boolean;
}

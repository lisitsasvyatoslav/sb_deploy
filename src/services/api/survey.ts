import { apiClient } from '@/services/api/client';
import type {
  SurveyQuestion,
  SurveyStatusResponse,
  SurveyHistoryItem,
  SurveyReminderStatus,
} from '@/types/survey';

export interface SurveyHistoryResponse {
  history: SurveyHistoryItem[];
}

/** Transform snake_case API response to camelCase SurveyQuestion */
function transformQuestion(data: Record<string, unknown>): SurveyQuestion {
  return {
    id: data.id as number,
    questionText: (data.question_text ?? data.questionText) as string,
    questionType: (data.question_type ?? data.questionType) as string,
    answerOptions: (data.answer_options ??
      data.answerOptions ??
      null) as SurveyQuestion['answerOptions'],
    isRequired: (data.is_required ?? data.isRequired ?? false) as boolean,
    displayOrder: (data.display_order ?? data.displayOrder ?? 0) as number,
  };
}

export const surveyApi = {
  async getStatus(): Promise<SurveyStatusResponse> {
    const resp = await apiClient.get('/survey/status');
    return resp.data;
  },

  async getNext(includeOptional = false): Promise<SurveyQuestion | null> {
    const resp = await apiClient.get('/survey/next', {
      params: { includeOptional },
    });
    if (!resp.data) return null;
    return transformQuestion(resp.data);
  },

  async getQuestionById(questionId: number): Promise<SurveyQuestion | null> {
    try {
      const resp = await apiClient.get(`/survey/question/${questionId}`);
      if (!resp.data) return null;
      return transformQuestion(resp.data);
    } catch (error) {
      return null;
    }
  },

  async putAnswer(
    questionId: number,
    answer: string[],
    chatId?: number
  ): Promise<SurveyStatusResponse> {
    const resp = await apiClient.put('/survey/answer', {
      questionId,
      answer,
      chatId,
    });
    return resp.data;
  },

  async reset(): Promise<SurveyStatusResponse> {
    const resp = await apiClient.put('/survey/reset');
    return resp.data;
  },

  async complete(): Promise<SurveyStatusResponse> {
    const resp = await apiClient.put('/survey/status', { status: 'completed' });
    return resp.data;
  },

  async getHistory(chatId: number): Promise<SurveyHistoryResponse> {
    const resp = await apiClient.get(`/survey/history/${chatId}`);
    const data = resp.data;
    return {
      history: (data.history || []).map((item: Record<string, unknown>) => ({
        questionText: (item.question_text ?? item.questionText) as string,
        answerTexts: (item.answer_texts ?? item.answerTexts ?? []) as string[],
      })),
    };
  },

  async getReminderStatus(minGap = 5): Promise<SurveyReminderStatus> {
    const resp = await apiClient.get('/survey/reminder-status', {
      params: { min_gap: minGap },
    });
    const data = resp.data;
    return {
      isCompleted: data.is_completed ?? data.isCompleted ?? false,
      messagesUntilReminder:
        data.messages_until_reminder ?? data.messagesUntilReminder ?? 0,
      shouldShowReminder:
        data.should_show_reminder ?? data.shouldShowReminder ?? false,
      exists: data.exists ?? false,
    };
  },

  async updateReminderStatus(payload: {
    isCompleted?: boolean;
    decrementMessage?: boolean;
    resetReminder?: boolean;
  }): Promise<SurveyReminderStatus> {
    const resp = await apiClient.put('/survey/reminder-status', {
      isCompleted: payload.isCompleted,
      decrementMessage: payload.decrementMessage ?? false,
      resetReminder: payload.resetReminder ?? false,
    });
    return resp.data;
  },
};

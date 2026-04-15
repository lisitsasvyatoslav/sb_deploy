import { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import type { TFunction } from 'i18next';
import { surveyApi } from '@/services/api/survey';
import { chatApi } from '@/services/api/chat';
import type { SurveyQuestion } from '@/types/survey';
import { trackYMEvent, YMGoal } from '@/shared/hooks/useYandexMetrika';

const PRIORITY_QUESTION_IDS = [10, 11, 13];

// Yandex Metrika `quiz_*` goals (product dashboards). Legacy `onboarding_*` (except guide) still sent in parallel.
// Chat survey gate uses `chat_survey_gate_started` so it does not collide with product guide `onboarding_started`.
// - quiz_required_completed: all required answers done, gate prompt shown.
// - quiz_full_completed: optional / limited flow completed without user abort (each success path that calls surveyApi.complete).
// - quiz_stopped: skip button or gate "later"; last_question = answered vs totalRequired as a capped percent string.

function quizStoppedParams(
  answered: number,
  totalRequired: number
): { failed_time: string; last_question: string } {
  const den = Math.max(totalRequired, 1);
  const pct = Math.min(100, Math.round((answered / den) * 100));
  return {
    failed_time: new Date().toISOString(),
    last_question: `${pct}%`,
  };
}
const MIN_SURVEY_GAP = 5;

function createPromptQuestion(t: TFunction<'chat'>): SurveyQuestion {
  return {
    id: -1,
    questionText: t('survey.gateQuestion'),
    questionType: 'single_choice',
    answerOptions: [
      { value: 'all', text: t('survey.gateAll') },
      { value: 'three', text: t('survey.gateThree') },
      { value: 'later', text: t('survey.gateLater') },
    ],
    isRequired: false,
    displayOrder: 999,
  };
}

export type SurveyPhase =
  | 'loading'
  | 'blocked'
  | 'prompt'
  | 'optional'
  | 'done'
  | 'reminder';

export function useChatSurveyGate(
  chatId: number | null | undefined,
  enabled: boolean,
  onMessagesUpdated?: () => void
) {
  const { t } = useTranslation('chat');
  const [surveyPhase, setSurveyPhase] = useState<SurveyPhase>('done');
  const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestion | null>(
    null
  );
  const [surveySelection, setSurveySelection] = useState<string[]>([]);
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  const [surveyProgress, setSurveyProgress] = useState<{
    currentQuestion: number;
    totalRequired: number;
  }>({ currentQuestion: 0, totalRequired: 0 });
  const requiredAnsweredRef = useRef(0);
  const optionalAnsweredRef = useRef(0);
  const onboardingStartedRef = useRef(false);
  const refsInitializedRef = useRef(false);
  // First moment user saw a required (blocked) question — passed to YM as quiz_required_completed.started_time.
  const requiredFlowStartedAtRef = useRef<string | null>(null);
  // Incremented on every chat switch so in-flight async work can detect staleness
  const chatGenerationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    chatGenerationRef.current += 1;
    refsInitializedRef.current = false;
    requiredFlowStartedAtRef.current = null;

    // CRITICAL: Reset state at the START of effect, not in cleanup —
    // prevents race condition where cleanup runs but new effect already started
    setSurveyPhase('done');
    setSurveyQuestion(null);
    setSurveySelection([]);

    (async () => {
      try {
        if (!enabled || !chatId || chatId === 0) return;

        await Promise.resolve();
        if (cancelled) return;

        setSurveyPhase('loading');

        const status = await surveyApi.getStatus();
        if (cancelled) return;

        if (!refsInitializedRef.current) {
          try {
            let requiredCount = 0;
            if (status.requiredAnswered) {
              requiredCount = Object.values(status.requiredAnswered).filter(
                Boolean
              ).length;
            }
            requiredAnsweredRef.current = requiredCount;

            const history = await surveyApi.getHistory(chatId);
            if (!cancelled && history) {
              const totalAnswered = history.history.length;
              optionalAnsweredRef.current = Math.max(
                0,
                totalAnswered - requiredCount
              );
            }

            if (
              requiredCount > 0 ||
              optionalAnsweredRef.current > 0 ||
              !status.completed
            ) {
              onboardingStartedRef.current = true;
            }

            refsInitializedRef.current = true;
          } catch (error) {
            console.error('Failed to initialize survey tracking refs:', error);
          }
        }

        if (!status.completed) {
          const answeredReq = Object.values(
            status.requiredAnswered || {}
          ).filter(Boolean).length;
          setSurveyProgress({
            currentQuestion: answeredReq + 1,
            totalRequired: status.remainingRequired + answeredReq,
          });

          const q = await surveyApi.getNext(false);
          if (cancelled) return;

          if (q) {
            setSurveyPhase('blocked');
            setSurveyQuestion(q);
            setSurveySelection([]);

            // Anchor funnel start for quiz_required_completed (YM).
            if (!requiredFlowStartedAtRef.current) {
              requiredFlowStartedAtRef.current = new Date().toISOString();
            }

            if (!onboardingStartedRef.current) {
              onboardingStartedRef.current = true;
              trackYMEvent('onboarding_survey_started', {});
            }
          } else {
            setSurveyPhase('done');
            setSurveyQuestion(null);
          }
        } else {
          const reminderStatus =
            await surveyApi.getReminderStatus(MIN_SURVEY_GAP);
          if (cancelled) return;

          if (reminderStatus.isCompleted) {
            setSurveyPhase('done');
            setSurveyQuestion(null);
            setSurveySelection([]);
          } else if (reminderStatus.exists) {
            setSurveyPhase('done');
            setSurveyQuestion(null);
            setSurveySelection([]);
          } else {
            const nextOptional = await surveyApi.getNext(true);
            if (cancelled) return;

            if (nextOptional) {
              const requiredCount = status.requiredAnswered
                ? Object.values(status.requiredAnswered).filter(Boolean).length
                : 0;

              if (status.answeredQuestions > requiredCount) {
                setSurveyPhase('optional');
                setSurveyQuestion(nextOptional);
                setSurveySelection([]);
              } else {
                setSurveyPhase('prompt');
                setSurveyQuestion(createPromptQuestion(t));
                setSurveySelection([]);
              }
            } else {
              setSurveyPhase('done');
              setSurveyQuestion(null);
              setSurveySelection([]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading survey:', error);
        if (!cancelled) {
          setSurveyPhase('done');
          setSurveyQuestion(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId, enabled, t]);

  const submitSurveyAnswer = useCallback(
    async (answer: string[]) => {
      if (!surveyQuestion || surveySubmitting || !enabled) return;

      if (!chatId || chatId === 0) {
        console.error('Cannot submit survey answer: invalid chatId', chatId);
        return;
      }

      const generation = chatGenerationRef.current;
      const isStale = () => chatGenerationRef.current !== generation;

      setSurveySubmitting(true);

      const answerTexts = answer.map((val) => {
        const opt = surveyQuestion.answerOptions?.find((o) => o.value === val);
        return opt?.text || val;
      });

      try {
        // Handle synthetic reminder question (id === -2)
        if (surveyQuestion.id === -2 && surveyPhase === 'reminder') {
          const choice = answer[0];

          if (choice === 'later') {
            setSurveyPhase('done');
            setSurveyQuestion(null);
            setSurveySelection([]);
            setSurveySubmitting(false);
            return;
          } else if (choice === 'continue') {
            trackYMEvent('onboarding_survey_continue_clicked', {
              from_reminder: true,
            });

            setSurveyQuestion(null);
            setSurveyPhase('loading');

            const next = await surveyApi.getNext(true);
            if (isStale()) return;
            setSurveySelection([]);
            if (!next) {
              await surveyApi
                .updateReminderStatus({ isCompleted: true })
                .catch(() => null);
              await surveyApi.complete().catch(() => null);
              trackYMEvent('quiz_full_completed', {
                completed_time: new Date().toISOString(),
              });
              setSurveyPhase('done');
              setSurveyQuestion(null);
              setSurveySubmitting(false);
              return;
            }
            setSurveyPhase('optional');
            setSurveyQuestion(next);
            setSurveySubmitting(false);
            return;
          }
        }

        // Handle synthetic prompt question (id === -1)
        if (surveyQuestion.id === -1 && surveyPhase === 'prompt') {
          const choice = answer[0];

          await chatApi.createSurveyMessage(
            chatId,
            surveyQuestion.questionText,
            answerTexts
          );
          if (isStale()) return;

          setSurveyQuestion(null);
          setSurveyPhase('loading');

          try {
            await chatApi.createSurveyFeedback(
              chatId,
              surveyQuestion.questionText,
              answerTexts
            );
          } catch (error) {
            console.error('Failed to generate survey feedback:', error);
          }
          if (isStale()) return;

          onMessagesUpdated?.();

          if (choice === 'later') {
            trackYMEvent('onboarding_survey_interrupted', {
              phase: 'prompt',
              questions_answered:
                requiredAnsweredRef.current + optionalAnsweredRef.current,
              required_answered: requiredAnsweredRef.current,
              optional_answered: optionalAnsweredRef.current,
            });

            await surveyApi
              .updateReminderStatus({ isCompleted: false })
              .catch(() => null);
            await surveyApi.complete().catch(() => null);

            setSurveyPhase('done');
            setSurveyQuestion(null);
            setSurveySelection([]);
            setSurveySubmitting(false);
            return;
          } else if (choice === 'three') {
            trackYMEvent('onboarding_survey_continued', {
              choice: 'three',
              required_answered: requiredAnsweredRef.current,
            });
            try {
              localStorage.setItem('survey_limited_mode', 'true');
              localStorage.setItem('survey_questions_answered', '0');
              localStorage.setItem(
                'survey_priority_questions',
                JSON.stringify(PRIORITY_QUESTION_IDS)
              );
            } catch {}
          } else if (choice === 'all') {
            trackYMEvent('onboarding_survey_continued', {
              choice: 'all',
              required_answered: requiredAnsweredRef.current,
            });
            try {
              localStorage.removeItem('survey_limited_mode');
              localStorage.removeItem('survey_questions_answered');
              localStorage.removeItem('survey_priority_questions');
            } catch {}
          }

          let next: SurveyQuestion | null = null;
          if (choice === 'three') {
            for (const qid of PRIORITY_QUESTION_IDS) {
              next = await surveyApi.getQuestionById(qid);
              if (isStale()) return;
              if (next) break;
            }
          } else {
            next = await surveyApi.getNext(true);
            if (isStale()) return;
          }

          setSurveySelection([]);
          if (!next) {
            await surveyApi.complete().catch(() => null);
            trackYMEvent('quiz_full_completed', {
              completed_time: new Date().toISOString(),
            });
            setSurveyPhase('done');
            setSurveyQuestion(null);
            setSurveySubmitting(false);
            return;
          }
          setSurveyPhase('optional');
          setSurveyQuestion(next);
          setSurveySubmitting(false);
          return;
        }

        // Regular survey question handling
        const savedPhase = surveyPhase;
        const savedQuestion = surveyQuestion;

        await chatApi.createSurveyMessage(
          chatId,
          surveyQuestion.questionText,
          answerTexts
        );
        if (isStale()) return;

        setSurveyQuestion(null);
        setSurveyPhase('loading');

        try {
          await chatApi.createSurveyFeedback(
            chatId,
            surveyQuestion.questionText,
            answerTexts
          );
        } catch (error) {
          console.error('Failed to generate survey feedback:', error);
        }
        if (isStale()) return;

        onMessagesUpdated?.();

        if (savedPhase === 'optional') {
          try {
            await surveyApi.putAnswer(savedQuestion.id, answer, chatId);
          } catch (error) {
            console.error('Failed to submit survey answer:', error);
            if (isStale()) return;
            setSurveyQuestion(savedQuestion);
            setSurveyPhase(savedPhase);
            setSurveySelection(answer);
            return;
          }
          if (isStale()) return;

          optionalAnsweredRef.current += 1;
          trackYMEvent('onboarding_survey_question_optional', {
            question_id: savedQuestion.id,
            answer,
            question_type: 'optional',
            question_number:
              requiredAnsweredRef.current + optionalAnsweredRef.current,
            total_answered:
              requiredAnsweredRef.current + optionalAnsweredRef.current,
            required_answered: requiredAnsweredRef.current,
            optional_answered: optionalAnsweredRef.current,
          });

          let isLimitedMode = false;
          let questionsAnswered = 0;
          let priorityQuestions: number[] = [];
          try {
            isLimitedMode =
              localStorage.getItem('survey_limited_mode') === 'true';
            questionsAnswered = parseInt(
              localStorage.getItem('survey_questions_answered') || '0',
              10
            );
            const stored = localStorage.getItem('survey_priority_questions');
            priorityQuestions = stored
              ? JSON.parse(stored)
              : PRIORITY_QUESTION_IDS;
          } catch {
            priorityQuestions = PRIORITY_QUESTION_IDS;
          }

          if (isLimitedMode) {
            questionsAnswered += 1;
            try {
              localStorage.setItem(
                'survey_questions_answered',
                String(questionsAnswered)
              );
            } catch {}

            if (questionsAnswered >= 3) {
              try {
                await chatApi.createSurveyFeedback(
                  chatId,
                  t('survey.completionTitle'),
                  [t('survey.completed3')]
                );
                onMessagesUpdated?.();
              } catch (error) {
                console.error(
                  'Failed to generate survey completion feedback:',
                  error
                );
              }

              await surveyApi
                .updateReminderStatus({ isCompleted: false })
                .catch(() => null);
              await surveyApi.complete().catch(() => null);

              try {
                localStorage.removeItem('survey_limited_mode');
                localStorage.removeItem('survey_questions_answered');
                localStorage.removeItem('survey_priority_questions');
              } catch {}
              trackYMEvent('quiz_full_completed', {
                completed_time: new Date().toISOString(),
              });
              setSurveyPhase('done');
              setSurveyQuestion(null);
              setSurveySelection([]);
              return;
            }

            let next: SurveyQuestion | null = null;
            for (const qid of priorityQuestions) {
              next = await surveyApi.getQuestionById(qid);
              if (isStale()) return;
              if (next) break;
            }

            setSurveySelection([]);
            if (next) {
              setSurveyPhase('optional');
              setSurveyQuestion(next);
              return;
            }

            try {
              await chatApi.createSurveyFeedback(
                chatId,
                t('survey.completionTitle'),
                [t('survey.completedAll')]
              );
              onMessagesUpdated?.();
            } catch (error) {
              console.error(
                'Failed to generate survey completion feedback:',
                error
              );
            }

            await surveyApi
              .updateReminderStatus({ isCompleted: false })
              .catch(() => null);
            await surveyApi.complete().catch(() => null);

            try {
              localStorage.removeItem('survey_limited_mode');
              localStorage.removeItem('survey_questions_answered');
              localStorage.removeItem('survey_priority_questions');
            } catch {}
            trackYMEvent('quiz_full_completed', {
              completed_time: new Date().toISOString(),
            });
            setSurveyPhase('done');
            setSurveyQuestion(null);
            return;
          }

          const next = await surveyApi.getNext(true);
          if (isStale()) return;
          setSurveySelection([]);
          if (next) {
            setSurveyPhase('optional');
            setSurveyQuestion(next);
            return;
          }

          await surveyApi
            .updateReminderStatus({ isCompleted: true })
            .catch(() => null);
          await surveyApi.complete().catch(() => null);

          try {
            localStorage.removeItem('survey_limited_mode');
            localStorage.removeItem('survey_questions_answered');
            localStorage.removeItem('survey_priority_questions');
          } catch {}
          trackYMEvent('quiz_full_completed', {
            completed_time: new Date().toISOString(),
          });
          setSurveyPhase('done');
          setSurveyQuestion(null);
          return;
        }

        let status;
        try {
          status = await surveyApi.putAnswer(savedQuestion.id, answer, chatId);
        } catch (error) {
          console.error('Failed to submit survey answer:', error);
          if (isStale()) return;
          setSurveyQuestion(savedQuestion);
          setSurveyPhase(savedPhase);
          setSurveySelection(answer);
          return;
        }
        if (isStale()) return;
        setSurveySelection([]);

        requiredAnsweredRef.current += 1;
        setSurveyProgress((prev) => ({
          ...prev,
          currentQuestion: Math.min(
            requiredAnsweredRef.current + 1,
            prev.totalRequired
          ),
        }));
        const questionNumber = requiredAnsweredRef.current;
        if (questionNumber === 1 || questionNumber === 2) {
          trackYMEvent(
            `onboarding_survey_question_${questionNumber}` as YMGoal,
            {
              question_id: savedQuestion.id,
              answer,
              question_type: 'required',
              total_answered: requiredAnsweredRef.current,
              required_answered: requiredAnsweredRef.current,
              optional_answered: 0,
            }
          );
        }

        setSurveyQuestion(null);
        setSurveyPhase('loading');

        if (status.completed) {
          // Required block finished; user sees all/three/later gate.
          trackYMEvent('quiz_required_completed', {
            started_time:
              requiredFlowStartedAtRef.current ?? new Date().toISOString(),
          });
          const promptQuestion = createPromptQuestion(t);
          setSurveyPhase('prompt');
          setSurveyQuestion(promptQuestion);
          setSurveySelection([]);
          onMessagesUpdated?.();
          return;
        }

        const next = await surveyApi.getNext(false);
        if (isStale()) return;
        if (!next) {
          setSurveyPhase('done');
          setSurveyQuestion(null);
          return;
        }
        // Resume required flow on a new chat / mid-flow without resetting funnel anchor.
        if (!requiredFlowStartedAtRef.current) {
          requiredFlowStartedAtRef.current = new Date().toISOString();
        }
        setSurveyQuestion(next);
        setSurveyPhase('blocked');
      } finally {
        setSurveySubmitting(false);
      }
    },
    [
      chatId,
      enabled,
      surveyQuestion,
      surveySubmitting,
      surveyPhase,
      surveyProgress.totalRequired,
      onMessagesUpdated,
      t,
    ]
  );

  const handleSurveySkip = useCallback(async () => {
    if (!enabled) return;
    setSurveySubmitting(true);
    try {
      if (surveyPhase === 'reminder') {
        trackYMEvent('onboarding_survey_interrupted', {
          phase: 'reminder',
          questions_answered:
            requiredAnsweredRef.current + optionalAnsweredRef.current,
          required_answered: requiredAnsweredRef.current,
          optional_answered: optionalAnsweredRef.current,
        });
        setSurveyPhase('done');
        setSurveyQuestion(null);
        setSurveySelection([]);
      } else if (surveyPhase === 'optional' || surveyPhase === 'prompt') {
        trackYMEvent('onboarding_survey_interrupted', {
          phase: surveyPhase,
          questions_answered:
            requiredAnsweredRef.current + optionalAnsweredRef.current,
          required_answered: requiredAnsweredRef.current,
          optional_answered: optionalAnsweredRef.current,
        });
        await surveyApi
          .updateReminderStatus({ isCompleted: false })
          .catch(() => null);
        await surveyApi.complete().catch(() => null);
        setSurveyPhase('done');
        setSurveyQuestion(null);
        setSurveySelection([]);
      } else {
        trackYMEvent(
          'quiz_stopped',
          quizStoppedParams(
            requiredAnsweredRef.current + optionalAnsweredRef.current,
            surveyProgress.totalRequired
          )
        );
        setSurveyPhase('done');
        setSurveyQuestion(null);
        setSurveySelection([]);
      }
    } finally {
      setSurveySubmitting(false);
    }
  }, [enabled, surveyPhase, surveyProgress.totalRequired]);

  const handleSurveyContinue = useCallback(async () => {
    if (!enabled) return;
    setSurveySubmitting(true);
    try {
      setSurveyQuestion(null);
      setSurveyPhase('loading');

      const next = await surveyApi.getNext(true);
      setSurveySelection([]);
      if (!next) {
        await surveyApi.complete().catch(() => null);
        trackYMEvent('quiz_full_completed', {
          completed_time: new Date().toISOString(),
        });
        setSurveyPhase('done');
        setSurveyQuestion(null);
        return;
      }
      setSurveyPhase('optional');
      setSurveyQuestion(next);
    } finally {
      setSurveySubmitting(false);
    }
  }, [enabled]);

  const markSurveyCompleted = useCallback(() => {
    if (!enabled) return;
    setSurveyPhase('done');
    surveyApi.complete().catch(() => null);
  }, [enabled]);

  const trackMessageAndCheckReminder = useCallback(async () => {
    if (!enabled || !chatId || chatId === 0) return;
    // Don't clobber an active survey — only show reminders when idle
    if (surveyPhase !== 'done') return;

    try {
      await surveyApi.updateReminderStatus({ decrementMessage: true });
      const status = await surveyApi.getReminderStatus(MIN_SURVEY_GAP);

      if (status.shouldShowReminder) {
        const reminderQuestion: SurveyQuestion = {
          id: -2,
          questionText: t('survey.reminderQuestion'),
          questionType: 'single_choice',
          answerOptions: [
            { value: 'continue', text: t('survey.reminderContinue') },
            { value: 'later', text: t('survey.reminderLater') },
          ],
          isRequired: false,
          displayOrder: 999,
        };

        setSurveyPhase('reminder');
        setSurveyQuestion(reminderQuestion);
        setSurveySelection([]);

        await surveyApi.updateReminderStatus({ resetReminder: true });
      }
    } catch (error) {
      console.error('Error checking survey reminder:', error);
    }
  }, [enabled, chatId, surveyPhase, t]);

  const createWelcomeAckMessage = useCallback(async () => {
    if (!chatId || chatId === 0) {
      console.error('Cannot create welcome ack: invalid chatId', chatId);
      return;
    }

    try {
      await chatApi.createWelcomeAck(chatId);
      onMessagesUpdated?.();
    } catch {
      // Silently fail - not critical
    }
  }, [chatId, onMessagesUpdated]);

  return {
    surveyPhase,
    surveyQuestion,
    surveySelection,
    setSurveySelection,
    surveySubmitting,
    surveyProgress,
    submitSurveyAnswer,
    handleSurveySkip,
    handleSurveyContinue,
    markSurveyCompleted,
    createWelcomeAckMessage,
    trackMessageAndCheckReminder,
  };
}

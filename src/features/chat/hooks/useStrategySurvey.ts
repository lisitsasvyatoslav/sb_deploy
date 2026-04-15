import { useState, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { Message, MessageType } from '@/types';

interface UseStrategySurveyParams {
  chatId: number;
  onAddLocalMessage?: (message: Message) => void;
}

interface UseStrategySurveyReturn {
  /** Whether the survey UI (StrategySurveyManager) should be shown in the input area */
  showSurvey: boolean;
  /** Current step number (0 = inactive, 1-7 = active steps) */
  currentStep: number;
  /** Whether the survey is currently processing a mock response */
  surveyLoading: boolean;
  /** Handle "Back" button in survey */
  handleBack: () => void;
  /** Handle step submission (selected instruments + optional custom text) */
  handleSubmit: (
    selectedInstruments: string[],
    customText?: string
  ) => Promise<void>;
  /**
   * Check if the user message is a survey trigger phrase.
   * If it is, creates mock messages and starts the survey.
   * Returns true if the trigger was detected (caller should skip normal send).
   */
  checkTrigger: (messageText: string) => Promise<boolean>;
}

// TODO [MOCK]: Раскомментировать после интеграции с бэкендом.
// Этот useEffect заменит хардкод-триггер и мок-переходы между шагами —
// опрос будет запускаться автоматически на основе prompt_meta из ответа AI.
// useEffect(() => {
//   const lastAssistantMsg = [...messages]
//     .reverse()
//     .find((msg) => msg.role === 'assistant' && (msg as any).promptMeta?.type);
//
//   if (lastAssistantMsg) {
//     const promptMeta = (lastAssistantMsg as any).promptMeta;
//     if (promptMeta?.type === 'instrument_selection') {
//       setCurrentStep(promptMeta.step || 1);
//       setShowSurvey(true);
//     }
//   }
// }, [messages]);

export function useStrategySurvey({
  chatId,
  onAddLocalMessage,
}: UseStrategySurveyParams): UseStrategySurveyReturn {
  const { t } = useTranslation('chat');
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [surveyLoading, setSurveyLoading] = useState(false);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const addLocalMessage = useCallback(
    (msg: Message) => {
      onAddLocalMessage?.(msg);
    },
    [onAddLocalMessage]
  );

  const makeMessage = useCallback(
    (
      role: 'user' | 'assistant',
      content: string,
      opts?: { userSurveyRows?: boolean; messageType?: MessageType }
    ): Message => ({
      id: -(Date.now() * 1000 + Math.floor(Math.random() * 1000)),
      chatId,
      userId: role === 'user' ? 'user' : 'assistant',
      role,
      content,
      messageType:
        opts?.messageType ??
        (role === 'user' && opts?.userSurveyRows ? 'survey_rows' : 'chat'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [chatId]
  );

  const transitionToStep = useCallback((step: number) => {
    setShowSurvey(false);
    setCurrentStep(step);
    setTimeout(() => {
      setShowSurvey(true);
      setSurveyLoading(false);
    }, 50);
  }, []);

  // TODO [MOCK]: Удалить всю функцию handleMockResponse после интеграции.
  // Вся логика переходов между шагами (currentStep), тексты ответов AI
  // и локальные сообщения (onAddLocalMessage) должны быть заменены на:
  // 1. Отправку выбора пользователя через onSendMessage
  // 2. Получение ответа AI с prompt_meta из потока сообщений
  // 3. Показ следующего шага на основе prompt_meta.step из ответа
  const handleMockResponse = useCallback(
    async (
      selectedInstruments: string[],
      customText?: string,
      step?: number
    ) => {
      // Step 7: Results — just close the survey, no messages needed
      if (step === 7) {
        setShowSurvey(false);
        setCurrentStep(0);
        setSurveyLoading(false);
        return;
      }

      setSurveyLoading(true);

      const selectedLabels = selectedInstruments
        .map((id) => t(`strategySurvey.options.${id}`, { defaultValue: id }))
        .join('\n');

      const combinedLabels = [selectedLabels, customText?.trim()]
        .filter(Boolean)
        .join('\n');

      const userMessageContent =
        step === 4 || step === 5 ? customText || '' : combinedLabels;

      const userSurveyRows = step === 2 || step === 3;
      addLocalMessage(
        makeMessage('user', userMessageContent, { userSurveyRows })
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 1: Chips confirmation
      if (step === 1) {
        const selectedId = selectedInstruments[0];
        if (selectedId === 'no') {
          setShowSurvey(false);
          setCurrentStep(0);
          setSurveyLoading(false);
          return;
        }
        addLocalMessage(
          makeMessage('assistant', t('strategySurvey.mock.step1Response'))
        );
        transitionToStep(2);

        // Step 2: Instruments selection
      } else if (step === 2) {
        addLocalMessage(
          makeMessage(
            'assistant',
            t('strategySurvey.mock.step2Response', {
              instruments: combinedLabels,
            })
          )
        );
        transitionToStep(3);

        // Step 3: Sectors selection
      } else if (step === 3) {
        const sectorsText = combinedLabels.replace(/\n/g, ' + ');
        addLocalMessage(
          makeMessage(
            'assistant',
            t('strategySurvey.mock.step3Ack', { sectors: sectorsText })
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        addLocalMessage(
          makeMessage('assistant', t('strategySurvey.mock.step3Question'))
        );
        transitionToStep(4);

        // Step 4: Target yield (text)
      } else if (step === 4) {
        addLocalMessage(
          makeMessage(
            'assistant',
            t('strategySurvey.mock.step4Ack', { target: customText })
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        addLocalMessage(
          makeMessage('assistant', t('strategySurvey.mock.step4Question'))
        );
        transitionToStep(5);

        // Step 5: Max drawdown (text)
      } else if (step === 5) {
        addLocalMessage(
          makeMessage(
            'assistant',
            t('strategySurvey.mock.step5Ack', { drawdown: customText })
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        addLocalMessage(
          makeMessage('assistant', t('strategySurvey.mock.step5Question'))
        );
        transitionToStep(6);

        // Step 6: How to start (radio)
      } else if (step === 6) {
        addLocalMessage(
          makeMessage('assistant', t('strategySurvey.mock.step6Response'))
        );
        // Marker message — rendered as strategy cards by ChatMessageList
        addLocalMessage(
          makeMessage('assistant', '', { messageType: 'strategy_results' })
        );
        transitionToStep(7);
      }
    },
    [addLocalMessage, makeMessage, transitionToStep, t]
  );

  const handleSubmit = useCallback(
    async (selectedInstruments: string[], customText?: string) => {
      // TODO [MOCK]: Убрать флаг useMock и блок ниже после интеграции с бэкендом.
      // При useMock=false выбор пользователя отправляется в AI через onSendMessage,
      // а переход между шагами управляется ответом AI (prompt_meta).
      const useMock = true;

      if (useMock) {
        await handleMockResponse(selectedInstruments, customText, currentStep);
        return;
      }

      // Non-mock path (for future integration)
      // const selectedLabels = selectedInstruments
      //   .map((id) => t(`strategySurvey.options.${id}`, { defaultValue: id }))
      //   .join('\n');
      // const messageText = selectedLabels;
      // await onSendMessage(messageText, ...);
    },
    [handleMockResponse, currentStep]
  );

  // TODO [MOCK]: Заменить на серверную логику. Триггер опроса должен приходить
  // из ответа AI (prompt_meta.type === 'instrument_selection'), а не по захардкоженной фразе.
  // После интеграции: удалить проверку triggerPhrase, локальные мок-сообщения
  // и использовать закомментированный useEffect с promptMeta (см. выше).
  const checkTrigger = useCallback(
    async (messageText: string): Promise<boolean> => {
      // Mock trigger: match both Russian and English phrases regardless of locale
      const triggerPhrases = [
        'я торгую довольно редко и аккуратно',
        'i trade quite rarely and carefully',
      ];
      const lowerMessage = messageText.toLowerCase();
      if (!triggerPhrases.some((phrase) => lowerMessage.includes(phrase))) {
        return false;
      }

      // TODO [MOCK]: Сообщения должны создаваться на сервере через onSendMessage,
      // а не локально через onAddLocalMessage. Убрать после интеграции.
      addLocalMessage(makeMessage('user', messageText));

      await new Promise((resolve) => setTimeout(resolve, 400));

      // TODO [MOCK]: Ответ AI должен приходить с сервера с prompt_meta,
      // а не формироваться локально с захардкоженным текстом.
      addLocalMessage(
        makeMessage('assistant', t('strategySurvey.mock.triggerResponse'))
      );
      setCurrentStep(1);
      setShowSurvey(true);
      return true;
    },
    [addLocalMessage, makeMessage, t]
  );

  return {
    showSurvey,
    currentStep,
    surveyLoading,
    handleBack,
    handleSubmit,
    checkTrigger,
  };
}

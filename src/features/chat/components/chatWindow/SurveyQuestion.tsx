import React, { useState, useEffect } from 'react';
import AnswerOptionButton from '@/shared/ui/AnswerOptionButton';
import { Icon } from '@/shared/ui/Icon/Icon';
import type { SurveyQuestion as SurveyQuestionType } from '@/types/survey';
import { useTranslation } from '@/shared/i18n/client';

interface SurveyProgress {
  currentQuestion: number;
  totalRequired: number;
}

interface SurveyQuestionProps {
  question: SurveyQuestionType;
  selection: string[];
  onSelectionChange: (selection: string[]) => void;
  onSubmit: (answer: string[]) => void;
  onSkip: () => void;
  submitting?: boolean;
  maxSelections?: number;
  progress?: SurveyProgress;
}

const TOTAL_DOTS = 30;
const DOTS_PER_ROW = 15;

function ProgressDots({ current, total }: { current: number; total: number }) {
  const filledDots = total > 0 ? Math.round((current / total) * TOTAL_DOTS) : 0;

  return (
    <div className="flex flex-col gap-[2px] items-end">
      {[0, 1].map((row) => (
        <div key={row} className="flex gap-[2px]">
          {Array.from({ length: DOTS_PER_ROW }).map((_, col) => {
            const i = row * DOTS_PER_ROW + col;
            return (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i < filledDots ? 'bg-accent' : 'bg-blackinverse-a8'
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  selection,
  onSelectionChange,
  onSubmit,
  onSkip,
  submitting = false,
  maxSelections = 100000,
  progress,
}) => {
  const { t } = useTranslation('chat');
  const isSingleChoice = question.questionType === 'single_choice';
  const hasOptions =
    question.answerOptions && question.answerOptions.length > 0;
  const [errorOptionValue, setErrorOptionValue] = useState<string | null>(null);
  const [showMaxError, setShowMaxError] = useState(false);

  useEffect(() => {
    if (errorOptionValue) {
      const timer = setTimeout(() => {
        setErrorOptionValue(null);
        setShowMaxError(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [errorOptionValue]);

  const handleOptionClick = (value: string) => {
    if (isSingleChoice) {
      onSubmit([value]);
      return;
    }

    if (selection.includes(value)) {
      onSelectionChange(selection.filter((v) => v !== value));
      setShowMaxError(false);
    } else if (selection.length < maxSelections) {
      onSelectionChange([...selection, value]);
      setShowMaxError(false);
    } else {
      setErrorOptionValue(value);
      setShowMaxError(true);
    }
  };

  const handleSubmitClick = () => {
    if (selection.length > 0) {
      onSubmit(selection);
    }
  };

  return (
    <div className="p-3 rounded-[4px] bg-blackinverse-a4">
      {/* Progress header */}
      {progress && progress.totalRequired > 0 && (
        <div className="flex items-center justify-between pb-1.5 mb-3">
          <div className="flex items-center gap-2 text-[12px] font-medium leading-[16px] tracking-[-0.2px] text-blackinverse-a56">
            <span>{t('survey.questionLabel', 'Вопрос')}</span>
            <span className="flex items-center gap-1">
              <span>{progress.currentQuestion}</span>
              <span>/</span>
              <span>{progress.totalRequired}</span>
            </span>
          </div>
          <ProgressDots
            current={progress.currentQuestion}
            total={progress.totalRequired}
          />
        </div>
      )}

      <div className="text-[14px] font-semibold text-blackinverse-a100 mb-1 leading-[20px] tracking-[-0.2px]">
        {question.questionText.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </div>

      {hasOptions && (
        <div className="flex flex-wrap gap-1 mt-3">
          {question.answerOptions?.map((opt) => {
            const isSelected = selection.includes(opt.value);
            const isError = errorOptionValue === opt.value;

            return (
              <AnswerOptionButton
                key={opt.value}
                onClick={() => handleOptionClick(opt.value)}
                disabled={submitting}
                selected={isSelected}
                error={isError}
                showIcon={!isSingleChoice}
              >
                {opt.text || opt.value}
              </AnswerOptionButton>
            );
          })}
        </div>
      )}

      {!isSingleChoice && (
        <div
          className={`text-xs mb-3 h-4 ${showMaxError ? 'text-red-500' : 'text-transparent'}`}
        >
          {showMaxError
            ? t('survey.maxSelections', { count: maxSelections })
            : '\u00A0'}
        </div>
      )}
      {isSingleChoice && <div className="mb-2" />}

      <div className="flex items-center gap-4 pt-3">
        {!isSingleChoice && (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={submitting || selection.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-[2px] bg-accent text-white text-[12px] font-medium leading-[16px] tracking-[-0.2px]
              hover:bg-accent-hover active:bg-accent-active transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('survey.submitAnswer')}
            <Icon variant="send" size={16} className="text-white" />
          </button>
        )}

        {!question.isRequired && (
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="text-[12px] leading-[16px] tracking-[-0.2px] text-blackinverse-a56 hover:text-blackinverse-a100 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('survey.skipSurvey')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyQuestion;

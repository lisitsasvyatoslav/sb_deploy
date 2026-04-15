'use client';

import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon/Icon';

type OnboardingStepItemProps = {
  number: number;
  text: string;
  isSurveyLink?: boolean;
  surveyRemaining?: number;
  surveyTotal?: number;
  isChecked?: boolean;
  onToggle?: () => void;
  /** When true, the step is visually dimmed and clicks are ignored */
  locked?: boolean;
};

export const OnboardingStepItem = ({
  number,
  text,
  isSurveyLink,
  surveyRemaining,
  surveyTotal,
  isChecked,
  onToggle,
  locked,
}: OnboardingStepItemProps) => {
  const { t } = useTranslation('chat');

  const isSurveyDone =
    isSurveyLink && surveyRemaining !== undefined && surveyRemaining === 0;

  return (
    <button
      type="button"
      onClick={locked ? undefined : onToggle}
      disabled={locked}
      className={`flex gap-3 items-center px-4 py-3 w-full text-left transition-colors ${
        locked
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:bg-blackinverse-a4'
      }`}
    >
      {/* Number badge or checkmark */}
      {isChecked ? (
        <div className="flex items-center justify-center min-h-[20px] min-w-[20px] shrink-0">
          <Icon variant="tick" size={16} className="text-[var(--brand-base)]" />
        </div>
      ) : (
        <div className="backdrop-blur-[40px] bg-blackinverse-a12 flex items-center justify-center min-h-[20px] min-w-[20px] px-1.5 rounded-[2px] shrink-0 tabular-nums font-semibold text-[12px] leading-[16px] text-blackinverse-a100">
          {number}
        </div>
      )}

      {/* Text */}
      <p
        className={`flex-1 text-[14px] leading-[20px] tracking-[-0.2px] min-w-0 transition-all duration-200 ${
          isChecked
            ? 'line-through text-blackinverse-a56'
            : 'text-blackinverse-a100'
        }`}
      >
        {text}
        {isSurveyLink &&
          surveyRemaining !== undefined &&
          surveyTotal !== undefined && (
            <>
              {' '}
              <span className="text-blackinverse-a56 text-[12px]">
                {t('onboarding.surveyQuestionsRemaining', {
                  remaining: surveyRemaining,
                  total: surveyTotal,
                })}
              </span>
            </>
          )}
      </p>

      {/* Checkmark when survey done */}
      {isSurveyDone && (
        <div className="shrink-0 size-[16px] rounded-full bg-[var(--brand-base)] flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="var(--brand-text___icon)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
};

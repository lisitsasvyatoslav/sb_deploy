import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/client';

interface SurveyFooterProps {
  onNext: () => void;
  nextDisabled?: boolean;
  onBack?: () => void;
  submitting?: boolean;
}

const btnNext = `
  flex items-center justify-center
  px-[8px] py-[4px] rounded-[2px]
  text-[12px] font-medium text-text-primary
  bg-blackinverse-a12 backdrop-blur-[12px]
  hover:bg-blackinverse-a32 transition
  disabled:opacity-40 disabled:cursor-not-allowed
`;

const btnBack = `
  flex items-center justify-center
  px-[8px] py-[4px]
  text-[12px] font-medium text-text-secondary
  hover:text-text-primary transition
  disabled:opacity-40 disabled:cursor-not-allowed
`;

const SurveyFooter: React.FC<SurveyFooterProps> = ({
  onNext,
  nextDisabled,
  onBack,
  submitting,
}) => {
  const { t } = useTranslation('chat');

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[#18C1FF]">
        <Zap className="w-3.5 h-3.5" />
        <span className="text-[13px] font-medium">
          {t('strategySurvey.title')}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className={btnBack}
          >
            {t('strategySurvey.back')}
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={submitting || nextDisabled}
          className={btnNext}
        >
          {t('strategySurvey.next')}
        </button>
      </div>
    </div>
  );
};

export default SurveyFooter;

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import SurveyHeader from '../ui/SurveyHeader';
import SurveyOptionItem from '../ui/SurveyOptionItem';
import SurveyFooter from '../ui/SurveyFooter';
import type { CheckboxStepConfig } from '../survey.config';

interface StrategySurveyCheckboxStepProps {
  config: CheckboxStepConfig;
  selection: string[];
  onToggle: (id: string) => void;
  usePortfolio: boolean;
  onTogglePortfolio: () => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
  onNext: () => void;
  onBack?: () => void;
  submitting?: boolean;
}

const StrategySurveyCheckboxStep: React.FC<StrategySurveyCheckboxStepProps> = ({
  config,
  selection,
  onToggle,
  usePortfolio,
  onTogglePortfolio,
  customText,
  onCustomTextChange,
  onNext,
  onBack,
  submitting,
}) => {
  const { t } = useTranslation('chat');
  const isValid =
    selection.length > 0 || customText.trim().length > 0 || usePortfolio;

  return (
    <div className="flex flex-col w-full pb-2">
      <SurveyHeader text={config.header} />

      <div className="flex flex-col gap-3 mb-3">
        {config.options.map((option) => (
          <SurveyOptionItem
            key={option.id}
            label={option.label}
            isSelected={selection.includes(option.id)}
            type="checkbox"
            disabled={submitting}
            onClick={() => onToggle(option.id)}
          />
        ))}

        {config.showPortfolioOption && (
          <SurveyOptionItem
            label={t('strategySurvey.portfolioOption')}
            isSelected={usePortfolio}
            type="checkbox"
            disabled={submitting}
            onClick={onTogglePortfolio}
          />
        )}
      </div>

      {config.showCustomText && (
        <input
          type="text"
          placeholder={t('strategySurvey.customPlaceholder')}
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          disabled={submitting}
          className="
            w-full px-3 py-2.5 mb-3
            rounded-[8px]
            bg-[var(--bg-card)] text-[14px] text-text-primary
            placeholder:text-[var(--text-muted)]
            border-none outline-none
            focus:ring-1 focus:ring-[var(--border-medium)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
      )}

      <SurveyFooter
        onNext={onNext}
        nextDisabled={!isValid}
        onBack={onBack}
        submitting={submitting}
      />
    </div>
  );
};

export default StrategySurveyCheckboxStep;

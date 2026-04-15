import React from 'react';
import SurveyHeader from '../ui/SurveyHeader';
import SurveyFooter from '../ui/SurveyFooter';
import type { TextStepConfig } from '../survey.config';

interface StrategySurveyTextStepProps {
  config: TextStepConfig;
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onBack?: () => void;
  submitting?: boolean;
}

const StrategySurveyTextStep: React.FC<StrategySurveyTextStepProps> = ({
  config,
  value,
  onChange,
  onNext,
  onBack,
  submitting,
}) => (
  <div className="flex flex-col w-full pb-2">
    <SurveyHeader text={config.header} />

    <input
      type="text"
      placeholder={config.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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

    <SurveyFooter
      onNext={onNext}
      nextDisabled={!value.trim()}
      onBack={onBack}
      submitting={submitting}
    />
  </div>
);

export default StrategySurveyTextStep;

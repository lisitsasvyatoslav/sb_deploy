import React from 'react';
import SurveyHeader from '../ui/SurveyHeader';
import SurveyOptionItem from '../ui/SurveyOptionItem';
import SurveyFooter from '../ui/SurveyFooter';
import type { RadioStepConfig } from '../survey.config';

interface StrategySurveyRadioStepProps {
  config: RadioStepConfig;
  selection: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack?: () => void;
  submitting?: boolean;
}

const StrategySurveyRadioStep: React.FC<StrategySurveyRadioStepProps> = ({
  config,
  selection,
  onSelect,
  onNext,
  onBack,
  submitting,
}) => (
  <div className="flex flex-col w-full pb-2">
    <SurveyHeader text={config.header} />

    <div className="flex flex-col gap-3 mb-3">
      {config.options.map((option) => (
        <SurveyOptionItem
          key={option.id}
          label={option.label}
          isSelected={selection === option.id}
          type="radio"
          disabled={submitting}
          onClick={() => onSelect(option.id)}
        />
      ))}
    </div>

    <SurveyFooter
      onNext={onNext}
      nextDisabled={!selection}
      onBack={onBack}
      submitting={submitting}
    />
  </div>
);

export default StrategySurveyRadioStep;

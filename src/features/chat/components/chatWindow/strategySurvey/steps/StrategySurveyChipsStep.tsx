import React from 'react';
import SurveyHeader from '../ui/SurveyHeader';
import type { ChipsStepConfig } from '../survey.config';

interface StrategySurveyChipsStepProps {
  config: ChipsStepConfig;
  onSelect: (id: string) => void;
  submitting?: boolean;
}

const StrategySurveyChipsStep: React.FC<StrategySurveyChipsStepProps> = ({
  config,
  onSelect,
  submitting,
}) => (
  <div className="flex flex-col w-full pb-2">
    <SurveyHeader text={config.header} />

    <div className="flex items-center gap-2">
      {config.options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          disabled={submitting}
          className="
            px-[8px] py-[4px] rounded-[2px]
            text-[12px] font-medium text-text-primary
            bg-blackinverse-a12 backdrop-blur-[12px]
            hover:bg-blackinverse-a32 transition
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export default StrategySurveyChipsStep;

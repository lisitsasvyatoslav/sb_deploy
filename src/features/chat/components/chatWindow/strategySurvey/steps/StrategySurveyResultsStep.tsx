import React from 'react';
import SurveyFooter from '../ui/SurveyFooter';
import type { ResultsStepConfig } from '../survey.config';

interface StrategySurveyResultsStepProps {
  config: ResultsStepConfig;
  onNext: () => void;
  onBack: () => void;
  submitting?: boolean;
}

const StrategySurveyResultsStep: React.FC<StrategySurveyResultsStepProps> = ({
  onNext,
  onBack,
  submitting,
}) => (
  <div className="flex flex-col w-full pb-2">
    <SurveyFooter onNext={onNext} onBack={onBack} submitting={submitting} />
  </div>
);

export default StrategySurveyResultsStep;

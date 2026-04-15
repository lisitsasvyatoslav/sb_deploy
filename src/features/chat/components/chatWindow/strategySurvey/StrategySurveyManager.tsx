import React, { useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getSurveySteps } from './survey.config';
import StrategySurveyChipsStep from './steps/StrategySurveyChipsStep';
import StrategySurveyCheckboxStep from './steps/StrategySurveyCheckboxStep';
import StrategySurveyTextStep from './steps/StrategySurveyTextStep';
import StrategySurveyRadioStep from './steps/StrategySurveyRadioStep';
import StrategySurveyResultsStep from './steps/StrategySurveyResultsStep';

interface StrategySurveyManagerProps {
  step: number;
  onSubmit: (selectedInstruments: string[], customText?: string) => void;
  onBack?: () => void;
  submitting?: boolean;
  initialSelection?: string[];
  showDisclaimer?: boolean;
}

const StrategySurveyManager: React.FC<StrategySurveyManagerProps> = ({
  step,
  onSubmit,
  onBack,
  submitting = false,
  initialSelection = [],
  showDisclaimer = true,
}) => {
  const { t } = useTranslation('chat');
  const [selection, setSelection] = useState<string[]>(initialSelection);
  const [radioSelection, setRadioSelection] = useState<string | null>(null);
  const [usePortfolio, setUsePortfolio] = useState(false);
  const [customText, setCustomText] = useState('');

  const config = getSurveySteps(t)[step];

  const handleToggle = (id: string) => {
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (!config) return;
    if (config.type === 'checkbox') {
      const portfolioText = usePortfolio
        ? t('strategySurvey.portfolioOption')
        : '';
      const combined = [customText, portfolioText].filter(Boolean).join('\n');
      onSubmit(selection, combined || undefined);
    } else if (config.type === 'text') {
      onSubmit([], customText || undefined);
    } else if (config.type === 'radio') {
      onSubmit(radioSelection ? [radioSelection] : []);
    } else if (config.type === 'results') {
      onSubmit([]);
    }
  };

  if (!config) return null;

  const showBack = step > 2;

  const disclaimer = showDisclaimer ? (
    <div className="text-center py-1 px-[10px] text-[6px] font-normal uppercase text-text-secondary tracking-[0.02em]">
      {t('disclaimer.shortUpper')}
    </div>
  ) : null;

  if (config.type === 'chips') {
    return (
      <div className="p-4">
        {disclaimer}
        <StrategySurveyChipsStep
          config={config}
          onSelect={(id) => onSubmit([id])}
          submitting={submitting}
        />
      </div>
    );
  }

  if (config.type === 'checkbox') {
    return (
      <div className="p-4">
        {disclaimer}
        <StrategySurveyCheckboxStep
          config={config}
          selection={selection}
          onToggle={handleToggle}
          usePortfolio={usePortfolio}
          onTogglePortfolio={() => setUsePortfolio((v) => !v)}
          customText={customText}
          onCustomTextChange={setCustomText}
          onNext={handleNext}
          onBack={showBack ? onBack : undefined}
          submitting={submitting}
        />
      </div>
    );
  }

  if (config.type === 'text') {
    return (
      <div className="p-4">
        {disclaimer}
        <StrategySurveyTextStep
          config={config}
          value={customText}
          onChange={setCustomText}
          onNext={handleNext}
          onBack={showBack ? onBack : undefined}
          submitting={submitting}
        />
      </div>
    );
  }

  if (config.type === 'radio') {
    return (
      <div className="p-4">
        {disclaimer}
        <StrategySurveyRadioStep
          config={config}
          selection={radioSelection}
          onSelect={setRadioSelection}
          onNext={handleNext}
          onBack={showBack ? onBack : undefined}
          submitting={submitting}
        />
      </div>
    );
  }

  if (config.type === 'results') {
    return (
      <div className="p-4">
        <StrategySurveyResultsStep
          config={config}
          onNext={handleNext}
          onBack={onBack!}
          submitting={submitting}
        />
        {disclaimer}
      </div>
    );
  }

  return null;
};

export default StrategySurveyManager;

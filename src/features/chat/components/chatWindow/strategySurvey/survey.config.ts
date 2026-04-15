import type { TFunction } from 'i18next';

export interface SurveyOption {
  id: string;
  label: string;
}

export interface ChipsStepConfig {
  type: 'chips';
  header: string;
  options: SurveyOption[];
}

export interface CheckboxStepConfig {
  type: 'checkbox';
  header: string;
  options: SurveyOption[];
  showPortfolioOption?: boolean;
  showCustomText?: boolean;
}

export interface TextStepConfig {
  type: 'text';
  header: string;
  placeholder: string;
}

export interface RadioStepConfig {
  type: 'radio';
  header: string;
  options: SurveyOption[];
}

export interface ResultsStepConfig {
  type: 'results';
  header: string;
}

export type StepConfig =
  | ChipsStepConfig
  | CheckboxStepConfig
  | TextStepConfig
  | RadioStepConfig
  | ResultsStepConfig;

export const getSurveySteps = (
  t: TFunction<'chat'>
): Record<number, StepConfig> => ({
  1: {
    type: 'chips',
    header: t('strategySurvey.steps.1.header'),
    options: [
      { id: 'yes', label: t('strategySurvey.options.yes') },
      { id: 'no', label: t('strategySurvey.options.no') },
    ],
  },
  2: {
    type: 'checkbox',
    header: t('strategySurvey.steps.2.header'),
    options: [
      { id: 'stocks_ru', label: t('strategySurvey.options.stocks_ru') },
      { id: 'bonds', label: t('strategySurvey.options.bonds') },
      { id: 'futures', label: t('strategySurvey.options.futures') },
      { id: 'forex', label: t('strategySurvey.options.forex') },
    ],
    showPortfolioOption: true,
    showCustomText: true,
  },
  3: {
    type: 'checkbox',
    header: t('strategySurvey.steps.3.header'),
    options: [
      { id: 'banks', label: t('strategySurvey.options.banks') },
      { id: 'metals', label: t('strategySurvey.options.metals') },
      { id: 'it', label: t('strategySurvey.options.it') },
      { id: 'blue_chips', label: t('strategySurvey.options.blue_chips') },
    ],
    showCustomText: true,
  },
  4: {
    type: 'text',
    header: t('strategySurvey.steps.4.header'),
    placeholder: t('strategySurvey.steps.4.placeholder'),
  },
  5: {
    type: 'text',
    header: t('strategySurvey.steps.5.header'),
    placeholder: t('strategySurvey.steps.5.placeholder'),
  },
  6: {
    type: 'radio',
    header: t('strategySurvey.steps.6.header'),
    options: [
      {
        id: 'by_markets',
        label: t('strategySurvey.options.by_markets'),
      },
      {
        id: 'by_portfolio',
        label: t('strategySurvey.options.by_portfolio_recommended'),
      },
    ],
  },
  7: {
    type: 'results',
    header: t('strategySurvey.steps.7.header'),
  },
});

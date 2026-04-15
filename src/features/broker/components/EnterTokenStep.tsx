import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAvailableBrokers } from '../constants';
import BrokerLogoBadge from './BrokerLogoBadge';
import CredentialField from './CredentialField';
import InfoLinkSection from './InfoLinkSection';
import StepHeader from './StepHeader';
// import SyncDepthDropdown from './SyncDepthDropdown';
import TokenInfoPopover from './TokenInfoPopover';
import TokenInstructionWizard from './TokenInstructionWizard';
import WizardTwoPanelLayout from './WizardTwoPanelLayout';

interface EnterTokenStepProps {
  brokerType: string;
  onSubmit: (
    credentials: Record<string, string>,
    connectionName?: string
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  syncDepthYears: number;
  onSyncDepthChange: (years: number) => void;
  onBack: () => void;
}

const EnterTokenStep: React.FC<EnterTokenStepProps> = ({
  brokerType,
  onSubmit,
  isLoading = false,
  error = null,
  successMessage = null,
  // syncDepthYears,
  // onSyncDepthChange,
  onBack,
}) => {
  const { t } = useTranslation('broker');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showInstructionWizard, setShowInstructionWizard] = useState(false);
  const [editedSinceError, setEditedSinceError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const availableBrokers = useMemo(() => getAvailableBrokers(t), [t]);
  const broker = availableBrokers.find((b) => b.type === brokerType);
  const fieldConfigs = broker?.credentialFields || [];
  const hasError = !!error && !editedSinceError;

  useEffect(() => {
    const fields = broker?.credentialFields || [];
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = '';
    });
    setCredentials(initial);
  }, [broker]);

  const isValid = fieldConfigs
    .filter((field) => field.required)
    .every((field) => credentials[field.name]?.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(credentials, broker?.name);
    }
  };

  useEffect(() => {
    setEditedSinceError(false);
  }, [error]);

  useEffect(() => {
    if (!isLoading && error) {
      const textarea = formRef.current?.querySelector('textarea');
      textarea?.focus();
    }
  }, [isLoading, error]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldName]: value }));
    if (error) setEditedSinceError(true);
  };

  if (showInstructionWizard) {
    return (
      <TokenInstructionWizard
        brokerType={brokerType}
        onClose={() => setShowInstructionWizard(false)}
      />
    );
  }

  return (
    <WizardTwoPanelLayout currentStep={2} onBack={onBack}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col"
        data-testid="enter-token-form"
      >
        <div className="flex-1 flex flex-col max-w-[432px] mx-auto w-full">
          {/* Logo */}
          <div className="mb-base-52">
            <BrokerLogoBadge brokerType={brokerType} />
          </div>

          {/* Header + Form */}
          <div className="flex flex-col gap-base-32 w-full">
            <StepHeader
              title={
                hasError
                  ? t('enterToken.errorTitle', { broker: broker?.name })
                  : t('enterToken.connectTo', { broker: broker?.name })
              }
              description={
                hasError
                  ? t('enterToken.errorDescription')
                  : t('enterToken.description')
              }
            />

            <div className="flex flex-col gap-base-20 w-full">
              {/* <SyncDepthDropdown
                value={syncDepthYears}
                onChange={onSyncDepthChange}
              /> */}

              <div className="flex flex-col gap-base-6 w-full">
                {fieldConfigs.map((field, index) => {
                  const isLast = index === fieldConfigs.length - 1;
                  return (
                    <CredentialField
                      key={field.name}
                      field={field}
                      value={credentials[field.name] || ''}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      disabled={isLoading}
                      error={
                        hasError ? (isLast ? (error ?? ' ') : ' ') : undefined
                      }
                      success={!!successMessage}
                      useTextArea={field.useTextArea}
                      hintClassName="text-14 leading-20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isValid && !isLoading && !successMessage) {
                            onSubmit(credentials, broker?.name);
                          }
                        }
                      }}
                    />
                  );
                })}
                <TokenInfoPopover />
              </div>
            </div>
          </div>

          {/* Button + Info Sections */}
          <div className="flex flex-col gap-base-24 w-full mt-base-32">
            <Button
              type="submit"
              disabled={!isValid || isLoading || !!successMessage}
              variant="accent"
              loading={isLoading}
              fullWidth
              data-testid="enter-token-submit"
            >
              {isLoading
                ? t('enterToken.connecting')
                : successMessage
                  ? t('enterToken.continue')
                  : t('enterToken.next')}
            </Button>

            {/* TODO: For non-Finam brokers, decide what info sections to display here once analytics are ready */}
            {brokerType === 'finam' && !successMessage && (
              <div className="flex flex-col gap-spacing-20 w-full">
                {broker?.tokenManual && (
                  <InfoLinkSection
                    title={t('enterToken.howToDo')}
                    description={broker.howToDoDescription ?? ''}
                    onClick={() => setShowInstructionWizard(true)}
                  />
                )}
                <InfoLinkSection
                  title={t('enterToken.notClient', { broker: broker?.name })}
                  description={
                    broker?.notClientDescription ??
                    t('enterToken.notClientText')
                  }
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </WizardTwoPanelLayout>
  );
};

export default EnterTokenStep;

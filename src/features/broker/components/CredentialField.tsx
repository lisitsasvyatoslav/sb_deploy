import { Icon } from '@/shared/ui/Icon';
import Input from '@/shared/ui/Input';
import TextArea from '@/shared/ui/TextArea';
import { useTranslation } from '@/shared/i18n/client';
import type { CredentialFieldConfig } from '@/types/broker';
import { cn } from '@/shared/utils/cn';
import React, { useState } from 'react';

interface CredentialFieldProps {
  field: CredentialFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  useTextArea?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  hintClassName?: string;
}

/**
 * Credential input field — renders TextArea (for long tokens like Finam)
 * or Input with optional password toggle (default for other brokers).
 */
const CredentialField: React.FC<CredentialFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
  success = false,
  useTextArea = false,
  onKeyDown,
  hintClassName,
}) => {
  const { t } = useTranslation('broker');
  const [visible, setVisible] = useState(false);

  const wrapperClassName = cn(
    'rounded-radius-2',
    error &&
      '[&_textarea]:text-colors-status_negative_base [&_input]:text-colors-status_negative_base',
    success &&
      '[&_textarea]:text-colors-status_success_base [&_input]:text-colors-status_success_base [&_.bg-wrapper-a6]:bg-colors-status_success_bg'
  );

  if (useTextArea) {
    return (
      <div className={wrapperClassName}>
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={2}
          error={error}
          hintClassName={hintClassName}
          onKeyDown={onKeyDown}
          data-testid={`credential-field-${field.name}`}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <Input
        type={
          field.type === 'password'
            ? visible
              ? 'text'
              : 'password'
            : field.type
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        size="md"
        error={error}
        onKeyDown={onKeyDown}
        data-testid={`credential-field-${field.name}`}
        rightIcon={
          field.type === 'password' ? (
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              className="p-base-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={visible ? t('enterToken.hide') : t('enterToken.show')}
            >
              <Icon variant={visible ? 'eyeHidden' : 'eye'} size={20} />
            </button>
          ) : undefined
        }
      />
    </div>
  );
};

export default CredentialField;

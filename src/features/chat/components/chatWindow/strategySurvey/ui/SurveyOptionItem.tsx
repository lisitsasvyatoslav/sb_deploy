import React from 'react';
import { Icon } from '@/shared/ui/Icon';

interface SurveyOptionItemProps {
  label: string;
  isSelected: boolean;
  type: 'checkbox' | 'radio';
  disabled?: boolean;
  onClick: () => void;
}

const SurveyOptionItem: React.FC<SurveyOptionItemProps> = ({
  label,
  isSelected,
  type,
  disabled,
  onClick,
}) => {
  const isRadio = type === 'radio';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span
        className={`
          w-[18px] h-[18px] flex items-center justify-center shrink-0
          transition-colors duration-150
          ${isRadio ? 'rounded-full' : 'rounded-[4px]'}
          ${
            isSelected
              ? 'bg-[var(--color-accent)] border border-[var(--color-accent)]'
              : 'border border-[var(--border-medium)] bg-transparent'
          }
        `}
      >
        {isSelected &&
          (isRadio ? (
            <span className="w-[8px] h-[8px] rounded-full bg-white" />
          ) : (
            <Icon variant="tick" size={14} className="text-white" />
          ))}
      </span>
      <span className="text-[13px] text-text-primary">{label}</span>
    </button>
  );
};

export default SurveyOptionItem;

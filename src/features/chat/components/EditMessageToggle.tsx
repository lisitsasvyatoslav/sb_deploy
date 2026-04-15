import Image from 'next/image';
import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface EditMessageToggleProps {
  /** Whether the message is currently in edit mode */
  isEditing: boolean;
  /** Callback when edit button is clicked */
  onEditClick: () => void;
  /** Callback when accept button is clicked (save changes) */
  onAccept: () => void;
  /** Callback when decline button is clicked (cancel changes) */
  onDecline: () => void;
  /** Additional CSS classes */
  className?: string;
}

const EditMessageToggle: React.FC<EditMessageToggleProps> = ({
  isEditing,
  onEditClick,
  onAccept,
  onDecline,
  className = '',
}) => {
  const { t } = useTranslation('chat');

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={onAccept}
          className="
            w-6 h-6 flex items-center justify-center rounded-6
            text-green-500 hover:text-green-400
            hover:bg-overlay-light
            transition-colors duration-150
          "
          aria-label={t('editMessage.save')}
        >
          <Image
            src="/images/check.svg"
            alt=""
            width={12}
            height={12}
            className="w-3 h-3 invert dark:invert-0"
          />
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="
            w-6 h-6 flex items-center justify-center rounded-6
            text-text-primary hover:text-red-400
            hover:bg-overlay-light
            transition-colors duration-150
          "
          aria-label={t('editMessage.cancel')}
        >
          <Image
            src="/images/close.svg"
            alt=""
            width={12}
            height={12}
            className="w-3 h-3 invert dark:invert-0"
          />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onEditClick}
      className={`
        w-6 h-6 flex items-center justify-center rounded-6
        hover:bg-overlay-light
        transition-colors duration-150
        ${className}
      `}
      aria-label={t('editMessage.edit')}
    >
      <Image
        src="/images/edit.svg"
        alt=""
        width={16}
        height={16}
        className="w-4 h-4 opacity-60 invert dark:invert-0"
      />
    </button>
  );
};

export default EditMessageToggle;

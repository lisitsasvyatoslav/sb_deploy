import React from 'react';
import { m } from 'framer-motion';
import { Icon } from '@/shared/ui/Icon';

interface AnswerOptionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showIcon?: boolean;
  error?: boolean;
  className?: string;
}

const shakeAnimation = {
  x: [0, -3, 3, -3, 3, 0],
  transition: { duration: 0.3 },
};

/**
 * Универсальная кнопка варианта ответа (Chip).
 * Используется в welcome-flow ("Да, мне все понятно") и в опросе.
 * - Невыбранный: иконка "+" серая, текст тёмный, белый фон
 * - Выбранный: иконка "+" поворачивается на 45° (×) фиолетовая, текст фиолетовый
 * - Error: красный border и текст + shake анимация
 */
const AnswerOptionButton: React.FC<AnswerOptionButtonProps> = ({
  children,
  onClick,
  disabled = false,
  selected = false,
  showIcon = true,
  error = false,
  className = '',
}) => {
  const getColorClasses = () => {
    if (error) {
      return 'text-red-500 border-red-500';
    }
    if (selected) {
      return 'text-accent border-accent/30';
    }
    return 'text-text-primary border-border-light hover:border-border-medium';
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (selected) return 'text-accent';
    return 'text-text-secondary';
  };

  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={error ? shakeAnimation : {}}
      className={`
        inline-flex items-center gap-1 px-2 py-1.5
        rounded-[20px] border text-sm font-normal text-left
        transition-colors duration-150 bg-background-card max-w-full
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getColorClasses()}
        ${className}
      `}
    >
      {showIcon && (
        <m.span
          animate={{ rotate: selected ? 45 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="inline-flex shrink-0"
        >
          <Icon variant="plus" size={14} className={getIconColor()} />
        </m.span>
      )}
      <span className="break-words text-inherit">{children}</span>
    </m.button>
  );
};

export default AnswerOptionButton;

import React from 'react';
import classNames from 'classnames';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
export type SearchInputSize = 'md' | 'sm';

/** Controlled search input — всегда передавайте value + onChange */
export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'className'
> {
  /** Размер инпута (md = 40px, sm = 32px) */
  size?: SearchInputSize;
  /** Callback при изменении значения */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Callback при очистке инпута */
  onClear?: () => void;
  /** Показывать ли кнопку очистки когда есть значение */
  showClearButton?: boolean;
  /** Дополнительный класс для корневого контейнера */
  className?: string;
}

/**
 * Figma: inputSearchMd / inputSearchSm
 * https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55088-5330
 *
 * Figma node: 55088:5330
 */

const SIZE_CONFIG = {
  md: {
    container: 'h-spacing-40 px-spacing-8 gap-spacing-8',
    text: 'text-16 tracking-[-0.2px]',
    iconSize: 24,
    clearSize: 24,
  },
  sm: {
    container: 'h-spacing-32 px-spacing-6 gap-spacing-6',
    text: 'text-14 leading-[20px] tracking-[-0.2px]',
    iconSize: 20,
    clearSize: 20,
  },
} as const;

const SearchInput: React.FC<
  SearchInputProps & { ref?: React.Ref<HTMLInputElement> }
> = ({
  value,
  onChange,
  onClear,
  showClearButton = true,
  size = 'md',
  className,
  disabled = false,
  ref,
  ...props
}) => {
  const { t } = useTranslation('common');
  const hasValue =
    value !== undefined && value !== null && String(value).length > 0;
  const config = SIZE_CONFIG[size];

  return (
    <search
      className={classNames(
        'group flex items-center',
        'bg-wrapper-a6',
        'border-[0.8px] rounded-radius-2',
        config.container,
        'border-stroke-a8',
        'focus-within:border-stroke-a12',
        disabled ? 'opacity-[0.35] cursor-not-allowed' : 'hover:opacity-80',
        'transition-[border-color,opacity] duration-150',
        className
      )}
    >
      <Icon
        variant="search"
        size={config.iconSize}
        className={classNames(
          'text-texticon-black_inverse_a32',
          'group-focus-within:text-texticon-black_inverse_a100'
        )}
      />

      <input
        ref={ref}
        type="search"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={classNames(
          'flex-1 min-w-0 bg-transparent border-none outline-none p-0',
          'text-texticon-black_inverse_a100',
          'placeholder:text-texticon-black_inverse_a32',
          'disabled:cursor-not-allowed',
          '[&::-webkit-search-cancel-button]:appearance-none',
          '[&::-webkit-search-decoration]:appearance-none',
          config.text
        )}
        {...props}
      />

      {showClearButton && hasValue && (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="flex-shrink-0 flex items-center justify-center text-texticon-black_inverse_a32 cursor-pointer disabled:cursor-not-allowed transition-opacity duration-150"
          aria-label={t('search.clear')}
        >
          <Icon variant="closeCircleBold" size={config.clearSize} />
        </button>
      )}
    </search>
  );
};

export default SearchInput;

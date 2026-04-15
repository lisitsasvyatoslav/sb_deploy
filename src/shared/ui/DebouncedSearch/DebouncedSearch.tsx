'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import SearchInput, { SearchInputProps } from '@/shared/ui/SearchInput';

interface DebouncedSearchProps extends Omit<
  SearchInputProps,
  'value' | 'onChange' | 'onClear'
> {
  value: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  delay?: number;
}

const DebouncedSearch = ({
  value,
  onChange,
  placeholder,
  delay = 500,
  size = 'md',
  ...inputProps
}: DebouncedSearchProps) => {
  const { t } = useTranslation('common');
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue || null);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange(null);
  };

  return (
    <SearchInput
      placeholder={placeholder ?? t('search.placeholder')}
      size={size}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onClear={handleClear}
      {...inputProps}
    />
  );
};

export default DebouncedSearch;

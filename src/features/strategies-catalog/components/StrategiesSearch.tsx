import { Search } from '@mui/icons-material';
import DebouncedSearch from '@/shared/ui/DebouncedSearch';
import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

export const StrategiesSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = '' }) => {
  const { t } = useTranslation('common');

  return (
    <div className={`relative w-full ${className} bg-[rgba(255,255,255,0.08)]`}>
      <DebouncedSearch
        value={value}
        onChange={(val) => onChange(val || '')}
        placeholder={
          placeholder ?? t('strategiesCatalog.filters.searchPlaceholder')
        }
        className="w-full pl-3 pr-10 py-2 bg-transparent border border-[rgba(255,255,255,0.05)] rounded-[4px] text-white placeholder:text-[#8E8E93] focus:outline-none focus:border-[rgba(255,255,255,0.1)]"
        delay={500}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 !text-[#8E8E93]" />
    </div>
  );
};

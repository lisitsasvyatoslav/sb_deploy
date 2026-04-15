import { MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { SORT_OPTIONS, SortOption } from './StrategiesFilters';
import { ArrowDownIcon } from '@/features/strategies-catalog/components/ArrowDownIcon';
import { useTranslation } from '@/shared/i18n/client';

interface StrategiesSelectorProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}
export const StrategiesSelector = ({
  sortBy,
  onSortChange,
}: StrategiesSelectorProps) => {
  const { t } = useTranslation('common');

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onSortChange(event.target.value as SortOption);
  };
  return (
    <Select
      value={sortBy}
      onChange={handleChange}
      IconComponent={(iconProps) => <ArrowDownIcon {...iconProps} />}
      className="bg-transparent rounded-[2px] min-w-[144px] h-10"
      sx={{
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255,255,255,0.1)',
        },
        '& .MuiSelect-icon': {
          color: '#AEAEB2',
          transition: 'transform 0.2s',
          fontSize: '10px',
        },
        '& .MuiSelect-iconOpen': {
          transform: 'rotate(180deg)',
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: '#040405',
            borderColor: 'rgba(255,255,255,0.1)',
            // Для выбранного пункта
            '& .MuiMenuItem-root.Mui-selected': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          },
        },
      }}
    >
      {SORT_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Typography
            variant="body2"
            className="text-[var(--Black-Inverse-A56)]"
          >
            {t(option.labelKey)}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

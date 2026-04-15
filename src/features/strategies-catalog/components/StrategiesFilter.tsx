import { FilterIcon } from '@/shared/ui/FilterIcon';
import Button from '@/shared/ui/Button';
export const StrategiesFilter = () => {
  return (
    <Button
      className="w-10 h-10 flex items-center justify-center bg-[rgba(255,255,255,0.08)]"
      variant="secondary"
    >
      <FilterIcon className="text-white" />
    </Button>
  );
};

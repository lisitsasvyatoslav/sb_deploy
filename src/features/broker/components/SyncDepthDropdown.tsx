import Button from '@/shared/ui/Button';
import { Dropdown } from '@/shared/ui/Dropdown';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/i18n/client';
import { useMemo } from 'react';

const MAX_SYNC_DEPTH_YEARS = 10;

interface SyncDepthDropdownProps {
  value: number;
  onChange: (years: number) => void;
}

/**
 * Sync depth selector — inline row with label and ghost dropdown trigger.
 *
 * Figma node: 3310:10837
 */
const SyncDepthDropdown: React.FC<SyncDepthDropdownProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation('broker');

  const items = useMemo(
    () =>
      Array.from({ length: MAX_SYNC_DEPTH_YEARS }, (_, i) => ({
        label: t('syncSettings.years', { count: i + 1 }),
        value: String(i + 1),
      })),
    [t]
  );

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-16 leading-24 font-semibold tracking-tight-2 text-blackinverse-a56">
        {t('enterToken.syncDepthLabel')}
      </span>
      <Dropdown
        className="w-[256px]"
        trigger={({ isOpen, onClick, triggerRef }) => (
          <Button
            ref={triggerRef}
            variant="ghost"
            size="sm"
            onClick={onClick}
            data-testid="sync-depth-dropdown"
            iconRight="chevronDown"
            className={cn(
              '[&_span:last-child_svg]:transition-transform',
              isOpen && '[&_span:last-child_svg]:rotate-180'
            )}
          >
            {t('syncSettings.years', { count: value })}
          </Button>
        )}
        items={items}
        selectedValue={String(value)}
        onSelect={(v) => onChange(Number(v))}
        placement="bottom-right"
        offset={8}
      />
    </div>
  );
};

export default SyncDepthDropdown;

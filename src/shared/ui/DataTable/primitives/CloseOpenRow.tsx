import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';

interface CloseOpenRowProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * CloseOpenRow — chevron toggle for expanding/collapsing table rows
 *
 * Figma node: 61027:40830 (closeOpenRow component set)
 *
 * States:
 *   State=close → chevronRightMicro 12×12
 *   State=Open  → chevronDownMicro  12×12
 */
const CloseOpenRow: React.FC<CloseOpenRowProps> = ({
  isOpen,
  onClick,
  className,
}) => (
  <button
    type="button"
    className={cn(
      'inline-flex items-center justify-center cursor-pointer bg-transparent border-none p-0',
      isOpen ? 'text-blackinverse-a100' : 'text-blackinverse-a32',
      className
    )}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    aria-label={isOpen ? 'Collapse row' : 'Expand row'}
  >
    <Icon variant={isOpen ? 'chevronDown' : 'chevronRight'} size={12} />
  </button>
);

export default CloseOpenRow;

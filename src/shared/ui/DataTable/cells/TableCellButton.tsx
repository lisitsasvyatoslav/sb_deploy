import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { type IconVariant } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';
import { cn } from '@/shared/utils/cn';
import { ButtonProps } from '@/shared/ui/Button/Button.types';
type TableCellButtonBase = {
  onClick: () => void;
  className?: string;
};

type TableCellButtonLabel = TableCellButtonBase & {
  /** Text button mode (Figma: 61082:2967) */
  label: string;
  icon?: never;
} & Pick<ButtonProps, 'variant'>;

type TableCellButtonIcon = TableCellButtonBase & {
  /**
   * Icon button mode (Figma: iconButtonSm 63468:16740 — 48×48, icon 20×20).
   * Pass an IconVariant string (e.g. "chevronRightSmall") or a ReactElement.
   */
  icon: IconVariant | React.ReactElement;
  label?: never;
  variant?: never;
};

type TableCellButtonProps = TableCellButtonLabel | TableCellButtonIcon;

function isIconMode(props: TableCellButtonProps): props is TableCellButtonIcon {
  return props.icon !== undefined;
}

/**
 * TableCellButton — inline action button inside a table cell.
 * Two modes:
 *   - label mode: text Button/XS (Figma: 61082:2967)
 *   - icon mode:  IconButton size=20 (Figma: iconButtonSm 63468:16740)
 *
 * Layout: row justify-end padding=4px 0px
 */
const TableCellButton: React.FC<TableCellButtonProps> = (props) => {
  const { onClick, className } = props;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  if (isIconMode(props)) {
    return (
      <div className={cn('flex items-center justify-end', className)}>
        <IconButton
          icon={props.icon}
          size={20}
          onClick={handleClick}
          className="p-spacing-4"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center justify-end py-spacing-4', className)}
    >
      <Button
        size="xs"
        variant={props.variant ?? 'ghost'}
        onClick={handleClick}
      >
        {props.label}
      </Button>
    </div>
  );
};

export default TableCellButton;

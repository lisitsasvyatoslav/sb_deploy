import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import IconButton from '@/shared/ui/IconButton';
import type { ToastProps, ToastType } from './Toast.types';

/**
 * Toast — notification component with type variants
 *
 * Figma node: 65415:1028
 */

const TYPE_CONFIG: Record<
  ToastType,
  { icon: IconVariant; iconColor: string; titleColor: string }
> = {
  success: {
    icon: 'tick',
    iconColor: 'text-colors-status_success_base',
    titleColor: 'text-colors-status_success_base',
  },
  warning: {
    icon: 'exclamationMarkCircle',
    iconColor: 'text-colors-status_warning_base',
    titleColor: 'text-colors-status_warning_base',
  },
  error: {
    icon: 'alertTriangle',
    iconColor: 'text-colors-status_negative_base',
    titleColor: 'text-colors-status_negative_base',
  },
  info: {
    icon: 'infoMarkCircle',
    iconColor: 'text-texticon-black_inverse_a100',
    titleColor: 'text-texticon-black_inverse_a100',
  },
};

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  caption,
  onClose,
  actions,
  className,
}) => {
  const config = TYPE_CONFIG[type];

  return (
    <div
      className={cn(
        'flex flex-row gap-spacing-8 p-spacing-12',
        'w-full max-w-[488px]',
        'bg-background-gray_high border border-stroke-a4',
        'rounded-radius-4 shadow-effects-panel backdrop-blur-effects-panel',
        className
      )}
    >
      <div>
        {/* Status icon */}
        <Icon
          variant={config.icon}
          size={20}
          className={cn('shrink-0', config.iconColor)}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-spacing-4 flex-1 min-w-0">
        {title && (
          <p
            className={cn(
              'text-14 leading-20 font-semibold tracking-tight-1',
              config.titleColor
            )}
          >
            {title}
          </p>
        )}
        {caption && (
          <p className="text-12 leading-16 font-normal tracking-tight-1 text-texticon-black_inverse_a56">
            {caption}
          </p>
        )}
        {actions && (
          <div className="flex flex-row gap-spacing-8 pt-spacing-8 pb-spacing-4">
            {actions}
          </div>
        )}
      </div>
      <div>
        {/* Close button */}
        {onClose && (
          <IconButton
            icon="closeSmall"
            size="sm"
            onClick={onClose}
            ariaLabel="Close"
            className="shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default Toast;

import { Icon } from '@/shared/ui/Icon';
import React from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@/shared/ui/IconButton';

export interface CustomToastProps {
  message: string;
  title?: string;
  icon?: React.ReactNode;
  button?: {
    text: string;
    onClick?: () => void;
    link?: string;
  };
  severity?: 'success' | 'error' | 'warning' | 'info';
  closeToast?: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  title,
  icon,
  button,
  severity = 'info',
  closeToast,
}) => {
  const router = useRouter();

  const getBackgroundStyle = () => {
    // Use theme-aware colors with slight tint for severity
    switch (severity) {
      case 'success':
        return {
          backgroundColor: 'var(--surface-medium)',
          borderLeft: '4px solid var(--status-success)',
        };
      case 'error':
        return {
          backgroundColor: 'var(--surface-medium)',
          borderLeft: '4px solid var(--status-negative)',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--surface-medium)',
          borderLeft: '4px solid var(--status-warning)',
        };
      case 'info':
      default:
        return {
          backgroundColor: 'var(--surface-medium)',
          borderLeft: '4px solid var(--brand-base)',
        };
    }
  };

  const handleButtonClick = () => {
    if (button?.onClick) {
      button.onClick();
    } else if (button?.link) {
      router.push(button.link);
    }
    closeToast?.();
  };

  return (
    <div
      data-testid="custom-toast"
      className="flex flex-col overflow-hidden relative w-full backdrop-blur-sm rounded-md shadow-lg py-2 px-3 mb-3 min-h-[50px] theme-border"
      style={getBackgroundStyle()}
    >
      <div className="flex flex-col w-full gap-2">
        {/* Row 1: Title and Close button (if title exists) */}
        {title && (
          <div className="flex items-center justify-between w-full gap-2">
            <p
              className="text-xs uppercase font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </p>
            <IconButton
              data-testid="toast-close"
              icon={
                <Icon
                  variant="close"
                  size={20}
                  style={{ color: 'var(--text-secondary)' }}
                />
              }
              onClick={closeToast}
              ariaLabel="Close"
              size={20}
              className="flex-shrink-0 p-spacing-4"
            />
          </div>
        )}

        {/* Row 2: Icon (optional) + Message + Close button (if no title) */}
        <div className="flex items-center w-full gap-2">
          {/* Icon - only if provided */}
          {icon && <div className="flex-shrink-0 w-8 h-8">{icon}</div>}

          {/* Message */}
          <p
            className="font-normal flex-1 font-sans text-sm leading-5 tracking-tight break-words"
            style={{ color: 'var(--text-primary)' }}
          >
            {message}
          </p>

          {/* Close button - only if no title */}
          {!title && (
            <IconButton
              data-testid="toast-close"
              icon={
                <Icon
                  variant="close"
                  size={20}
                  style={{ color: 'var(--text-secondary)' }}
                />
              }
              onClick={closeToast}
              ariaLabel="Close"
              size={20}
              className="flex-shrink-0 p-spacing-4"
            />
          )}
        </div>
      </div>

      {/* Button row - only if button provided */}
      {button && (
        <div className="flex items-start justify-center w-full mt-2">
          <button
            data-testid="toast-action"
            onClick={handleButtonClick}
            className="flex items-center justify-center hover:opacity-80 transition-opacity w-full rounded-md py-1 px-2 border-none cursor-pointer font-sans font-medium text-xs leading-4 tracking-tight bg-[var(--bg-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {button.text}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomToast;

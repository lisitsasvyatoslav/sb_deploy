import { Icon } from '@/shared/ui/Icon';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import TickerIcon from '../TickerIcon';
import IconButton from '@/shared/ui/IconButton';

export interface SignalToastProps {
  iconUrl: string;
  messageTicker?: { ticker: string; securityId?: number };
  message: string;
  sourceName: string;
  button?: {
    text: string;
    link?: string;
    onClick?: () => void;
  };
  closeToast?: () => void;
}

const SignalToast: React.FC<SignalToastProps> = ({
  iconUrl,
  messageTicker,
  sourceName,
  message,
  button,
  closeToast,
}) => {
  const router = useRouter();

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
      data-testid="signal-toast"
      className="flex flex-col items-center overflow-hidden relative w-full backdrop-blur-sm rounded-md shadow-lg pt-1 px-2 pb-2 mb-3 theme-border bg-surface-medium"
    >
      {/* Two columns layout */}
      <div className="flex items-center w-full gap-2">
        {/* Column 1: Source Icon (vertically centered) */}
        <div className="flex-shrink-0 w-8 h-8">
          <Image
            src={iconUrl}
            alt="Signal source"
            className="w-full h-full object-contain theme-icon-invert"
            width={32}
            height={32}
          />
        </div>

        {/* Column 2: Source name + close button (row 1) and message (row 2) */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Row 1: Source Name and Close button */}
          <div className="flex items-center justify-between w-full gap-2">
            <p
              className="text-xs uppercase font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {sourceName}
            </p>
            <IconButton
              data-testid="signal-toast-close"
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

          {/* Row 2: Message with ticker */}
          <div className="flex items-center gap-2">
            {messageTicker?.ticker && (
              <TickerIcon
                symbol={messageTicker.ticker}
                securityId={messageTicker.securityId}
                size={20}
              />
            )}
            <p
              className="font-normal flex-1 font-sans text-sm leading-5 tracking-tight break-words"
              style={{ color: 'var(--text-primary)' }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Button row */}
      {button && (
        <div className="flex items-start justify-center w-full mt-2">
          <button
            data-testid="signal-toast-action"
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

export default SignalToast;

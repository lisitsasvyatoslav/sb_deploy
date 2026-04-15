import CustomToast from '@/shared/ui/Toast/CustomToast';
import SignalToast from '@/shared/ui/Toast/SignalToast';
import { Toast } from '@/shared/ui/Toast';
import type { ToastType } from '@/shared/ui/Toast';
import { toast, ToastOptions } from 'react-toastify';

// Signal source types
export type SignalSource = 'tradingview' | 'telegram' | 'custom';

// Configuration for different signal sources
const signalSourceConfig: Record<
  SignalSource,
  { iconUrl: string; name: string }
> = {
  tradingview: {
    iconUrl: '/images/trading-view-white-logo.svg',
    name: 'Trading View',
  },
  telegram: {
    iconUrl: '/images/telegram-logo.svg',
    name: 'Telegram',
  },
  custom: {
    iconUrl: '/images/signal-logo.svg',
    name: 'Custom Signal',
  },
};

/**
 * Show a signal toast with full features (automatic icon based on source)
 * Universal toast for different signal sources
 */
export const showSignalToast = (params: {
  source: SignalSource;
  messageTicker?: { ticker: string; securityId?: number };
  message: string;
  button?: {
    text: string;
    link?: string;
    onClick?: () => void;
  };
  duration?: number;
}) => {
  const config = signalSourceConfig[params.source];

  const options: ToastOptions = {
    autoClose: params.duration ?? 5000,
  };

  toast(
    ({ closeToast }) => (
      <SignalToast
        iconUrl={config.iconUrl}
        sourceName={config.name}
        messageTicker={params.messageTicker}
        message={params.message}
        button={params.button}
        closeToast={closeToast}
      />
    ),
    options
  );
};

/**
 * Show a success toast
 */
export const showSuccessToast = (message: string, duration?: number) => {
  const options: ToastOptions = {
    autoClose: duration ?? 5000,
  };

  toast(
    ({ closeToast }) => (
      <CustomToast
        message={message}
        severity="success"
        closeToast={closeToast}
      />
    ),
    options
  );
};

/**
 * Show a toast using the UI Toast component (Figma design system)
 */
export const showUiToast = (params: {
  type?: ToastType;
  title?: string;
  caption?: string;
  duration?: number;
  position?: ToastOptions['position'];
}) => {
  const {
    type,
    title,
    caption,
    duration = 5000,
    position = 'bottom-center',
  } = params;

  const options: ToastOptions = {
    autoClose: duration,
    closeButton: false,
    position,
    style: { background: 'transparent', boxShadow: 'none', padding: 0 },
  };

  toast(
    ({ closeToast }) => (
      <Toast type={type} title={title} caption={caption} onClose={closeToast} />
    ),
    options
  );
};

/**
 * Show an error toast
 */
export const showErrorToast = (message: string, duration?: number) => {
  const options: ToastOptions = {
    autoClose: duration ?? 5000,
  };

  toast(
    ({ closeToast }) => (
      <CustomToast message={message} severity="error" closeToast={closeToast} />
    ),
    options
  );
};

/**
 * Show a warning toast
 */
export const showWarningToast = (message: string, duration?: number) => {
  const options: ToastOptions = {
    autoClose: duration ?? 5000,
  };

  toast(
    ({ closeToast }) => (
      <CustomToast
        message={message}
        severity="warning"
        closeToast={closeToast}
      />
    ),
    options
  );
};

/**
 * Show an info toast
 */
export const showInfoToast = (message: string, duration?: number) => {
  const options: ToastOptions = {
    autoClose: duration ?? 5000,
  };

  toast(
    ({ closeToast }) => (
      <CustomToast message={message} severity="info" closeToast={closeToast} />
    ),
    options
  );
};

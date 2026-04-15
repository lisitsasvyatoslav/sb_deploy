export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  /** Toast type variant — determines icon and title color */
  type?: ToastType;
  /** Toast title */
  title?: string;
  /** Caption text below title */
  caption?: string;
  /** Called when close button is clicked */
  onClose?: () => void;
  /** Optional action buttons (slot) */
  actions?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

import type { ModalHeaderProps } from './Modal.types';

export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return <div className={`shrink-0 px-6 pb-4 ${className}`}>{children}</div>;
}

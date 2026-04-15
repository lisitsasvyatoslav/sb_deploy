import type { ModalTitleProps } from './Modal.types';

export function ModalTitle({ children, className = '' }: ModalTitleProps) {
  return (
    <h2
      className={`text-2xl font-semibold leading-8 text-[var(--text-primary)] tracking-[-0.4px] ${className}`}
    >
      {children}
    </h2>
  );
}

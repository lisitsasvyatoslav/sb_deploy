import type { ModalBodyProps } from './Modal.types';

export function ModalBody({
  children,
  className = '',
  padding = 'default',
}: ModalBodyProps) {
  const paddingClass = {
    none: '',
    default: 'p-6',
    large: 'px-8',
  }[padding];

  return (
    <div
      className={`flex-1 min-h-0 overflow-y-auto ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
}

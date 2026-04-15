import type { ModalFooterProps } from './Modal.types';

const alignClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export function ModalFooter({
  children,
  className = '',
  align = 'between',
  leftContent,
}: ModalFooterProps) {
  return (
    <div
      className={`shrink-0 flex items-center p-4 gap-3 ${leftContent ? 'justify-between' : alignClass[align]} ${className}`}
    >
      {leftContent ? (
        <>
          {leftContent}
          <div className="flex items-center gap-3">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

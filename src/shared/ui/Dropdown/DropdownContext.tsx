import { createContext, useContext } from 'react';
import type { DropdownContextValue } from './Dropdown.types';

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      'Dropdown compound components must be used within <Dropdown>'
    );
  }
  return context;
}

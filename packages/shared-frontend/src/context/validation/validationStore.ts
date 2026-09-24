import { createContext, useContext } from 'react';
import { ValidationContextValue } from './validationContextTypes';

interface ValidationStore {
  subscribe: (listener: () => void) => () => void;
  getVersion: () => number;
  getValue: () => ValidationContextValue;
}

const ValidationContext = createContext<ValidationStore | undefined>(undefined);

const useValidationStore = (): ValidationStore => {
  const store = useContext(ValidationContext);
  if (!store) {
    throw new Error('Validation context is required to use validation.');
  }
  return store;
};

const useOptionalValidationStore = (): ValidationStore | undefined => useContext(ValidationContext);

export { useOptionalValidationStore, useValidationStore, ValidationContext };
export type { ValidationStore };

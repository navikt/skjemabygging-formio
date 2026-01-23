import { ComponentError } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

interface ErrorsContextType {
  errors?: ComponentError[];
  setErrors: Dispatch<SetStateAction<ComponentError[]>>;
  addError: (message: string, elementId?: string) => void;
}

interface ErrorsProviderProps {
  children: React.ReactNode;
}

const ErrorsContext = createContext<ErrorsContextType>({} as ErrorsContextType);

const ErrorsProvider = ({ children }: ErrorsProviderProps) => {
  const [errors, setErrors] = useState<ComponentError[]>([]);

  const addError = useCallback(
    (message: string, elementId?: string) => {
      setErrors((prevErrors: ComponentError[]) => [
        ...prevErrors,
        {
          message,
          elementId,
          path: '',
          level: 'error',
        },
      ]);
    },
    [setErrors],
  );

  return (
    <ErrorsContext.Provider
      value={{
        errors,
        setErrors,
        addError,
      }}
    >
      {children}
    </ErrorsContext.Provider>
  );
};

export const useErrors = () => useContext(ErrorsContext);

export default ErrorsProvider;

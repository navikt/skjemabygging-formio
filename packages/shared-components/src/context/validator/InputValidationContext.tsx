import { createContext, RefObject, useCallback, useContext, useEffect, useState } from 'react';
import useValidators, { FormComponentError, FormComponentValidation, Validators } from './Validators';

interface ValidatorContextType {
  addValidation: (
    submissionPath: string,
    ref: RefObject<HTMLInputElement>,
    validators: Validators,
    field: string,
  ) => void;
  removeValidation: (submissionPath: string) => void;
  isValid: () => boolean;
  errors: FormComponentError[];
  getRefError: (ref: RefObject<HTMLInputElement>) => string;
  clearErrors: () => void;
}

interface ValidatorProviderProps {
  children: React.ReactNode;
}

const InputValidationContext = createContext<ValidatorContextType>({} as ValidatorContextType);

const InputValidationProvider = ({ children }: ValidatorProviderProps) => {
  const { validateAll } = useValidators();
  const [errors, setErrors] = useState<FormComponentError[]>([]);
  const [componentValidations, setComponentValidations] = useState<FormComponentValidation[]>([]);

  const addValidation = useCallback(
    (submissionPath: string, ref: RefObject<HTMLInputElement>, validators: Validators, field: string) => {
      if (ref.current && Object.keys(validators).length > 0) {
        setComponentValidations((prevRefs) => [...prevRefs, { ref, submissionPath, validators, field }]);
      }
    },
    [setComponentValidations],
  );

  const removeValidation = useCallback(
    (submissionPath: string) => {
      setComponentValidations((prevRefs) => [
        ...prevRefs.filter((validationRef) => validationRef.submissionPath !== submissionPath),
      ]);
      setErrors((prevErrors) => [...prevErrors.filter((error) => error.submissionPath !== submissionPath)]);
    },
    [setComponentValidations],
  );

  const validate = useCallback(() => {
    if (componentValidations.length > 0) {
      const errorMessages = validateAll(componentValidations);

      setErrors(errorMessages);

      return errorMessages;
    }

    return [];
  }, [componentValidations, validateAll]);

  const isValid = useCallback(() => {
    return validate().length === 0;
  }, [validate]);

  const getRefError = useCallback(
    (ref: RefObject<HTMLInputElement>) => {
      const error = errors.find((error) => error.ref === ref);
      return error ? error.message : '';
    },
    [errors],
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  useEffect(() => {
    if (errors.length > 0) {
      validate();
    }
    // Do not include errors in dependency array to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate]);

  return (
    <InputValidationContext.Provider
      value={{
        addValidation,
        removeValidation,
        isValid,
        errors,
        getRefError,
        clearErrors,
      }}
    >
      {children}
    </InputValidationContext.Provider>
  );
};

export const useInputValidation = () => useContext(InputValidationContext);

export default InputValidationProvider;

export type { Validators };

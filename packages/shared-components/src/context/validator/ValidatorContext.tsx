import { createContext, RefObject, useCallback, useContext, useEffect, useState } from 'react';
import useValidators, { FormComponentError, FormComponentValidation } from './Validators';

interface Validators {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

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

const ValidatorContext = createContext<ValidatorContextType>({} as ValidatorContextType);

const ValidatorProvider = ({ children }: ValidatorProviderProps) => {
  const { validateAll } = useValidators();
  const [errors, setErrors] = useState<FormComponentError[]>([]);
  const [componentValidations, setComponentValidations] = useState<FormComponentValidation[]>([]);

  const addValidationRef = useCallback(
    (submissionPath: string, ref: RefObject<HTMLInputElement>, validators: Validators, field: string) => {
      if (ref.current && Object.keys(validators).length > 0) {
        setComponentValidations((prevRefs) => [...prevRefs, { ref, submissionPath, validators, field }]);
      }
    },
    [setComponentValidations],
  );

  const removeValidationRef = useCallback(
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
    <ValidatorContext.Provider
      value={{
        addValidation: addValidationRef,
        removeValidation: removeValidationRef,
        isValid,
        errors,
        getRefError,
        clearErrors,
      }}
    >
      {children}
    </ValidatorContext.Provider>
  );
};

export const useValidator = () => useContext(ValidatorContext);

export default ValidatorProvider;

export type { Validators };

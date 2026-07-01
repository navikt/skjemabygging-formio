import { Component, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { deriveValidations } from '../../validation/deriveValidations';
import { validateValue } from '../../validation/validators';
import { useLanguage } from '../language/LanguageContext';
import { useSubmission } from '../submission/SubmissionContext';

interface FieldError {
  submissionPath: string;
  field: string;
  message: string;
}

interface ValidationContextType {
  errors: FieldError[];
  pagesWithErrors: Set<string>;
  summaryVisible: boolean;
  validatePage: (pageKey: string, components: Component[]) => boolean;
  validatePages: (pages: { pageKey: string; components: Component[] }[]) => boolean;
  getError: (submissionPath: string) => string | undefined;
  clearFieldError: (submissionPath: string) => void;
  hasErrorState: (pageKey: string) => boolean;
  hideSummary: () => void;
}

interface Props {
  children: ReactNode;
}

const ValidationContext = createContext<ValidationContextType>({} as ValidationContextType);

const ValidationProvider = ({ children }: Props) => {
  const { translate } = useLanguage();
  const { submission } = useSubmission();
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [pagesWithErrors, setPagesWithErrors] = useState<Set<string>>(new Set());
  const [summaryVisible, setSummaryVisible] = useState(false);

  const computeErrors = useCallback(
    (components: Component[]): FieldError[] =>
      deriveValidations(components).reduce<FieldError[]>((acc, { submissionPath, field, rules }) => {
        const violation = validateValue(submissionUtils.getSubmissionValue(submissionPath, submission), field, rules);
        if (violation) {
          acc.push({ submissionPath, field, message: translate(violation.textKey, violation.params) });
        }
        return acc;
      }, []),
    [submission, translate],
  );

  const validatePage = useCallback(
    (pageKey: string, components: Component[]) => {
      const pageErrors = computeErrors(components);
      const pagePaths = new Set(deriveValidations(components).map((descriptor) => descriptor.submissionPath));
      setErrors((prev) => [...prev.filter((e) => !pagePaths.has(e.submissionPath)), ...pageErrors]);
      setPagesWithErrors((prev) => {
        const next = new Set(prev);
        if (pageErrors.length > 0) next.add(pageKey);
        else next.delete(pageKey);
        return next;
      });
      setSummaryVisible(pageErrors.length > 0);
      return pageErrors.length === 0;
    },
    [computeErrors],
  );

  const validatePages = useCallback(
    (pages: { pageKey: string; components: Component[] }[]) => {
      const allErrors: FieldError[] = [];
      const failedPages = new Set<string>();
      pages.forEach(({ pageKey, components }) => {
        const pageErrors = computeErrors(components);
        if (pageErrors.length > 0) failedPages.add(pageKey);
        allErrors.push(...pageErrors);
      });
      setErrors(allErrors);
      setPagesWithErrors(failedPages);
      return allErrors.length === 0;
    },
    [computeErrors],
  );

  const clearFieldError = useCallback((submissionPath: string) => {
    setErrors((prev) => prev.filter((e) => e.submissionPath !== submissionPath));
  }, []);

  const getError = useCallback(
    (submissionPath: string) => errors.find((e) => e.submissionPath === submissionPath)?.message,
    [errors],
  );

  const hasErrorState = useCallback((pageKey: string) => pagesWithErrors.has(pageKey), [pagesWithErrors]);
  const hideSummary = useCallback(() => setSummaryVisible(false), []);

  const value = useMemo(
    () => ({
      errors,
      pagesWithErrors,
      summaryVisible,
      validatePage,
      validatePages,
      getError,
      clearFieldError,
      hasErrorState,
      hideSummary,
    }),
    [
      errors,
      pagesWithErrors,
      summaryVisible,
      validatePage,
      validatePages,
      getError,
      clearFieldError,
      hasErrorState,
      hideSummary,
    ],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
};

const useValidation = () => useContext(ValidationContext);

export { useValidation, ValidationProvider };
export type { FieldError, ValidationContextType };

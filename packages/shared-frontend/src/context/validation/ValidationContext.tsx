import { Component, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { deriveValidations } from '../../validation/deriveValidations';
import { validateValue } from '../../validation/validators';
import { useAppConfig } from '../app-config/AppConfigContext';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';

interface FieldError {
  pageKey: string;
  submissionPath: string;
  field: string;
  message: string;
}

type ValidationPage = { pageKey: string; components: Component[] };
type SummaryScope = { type: 'page'; pageKey: string } | { type: 'summary' } | undefined;

const togglePageInSet = (pages: Set<string>, pageKey: string, shouldContain: boolean): Set<string> => {
  if (pages.has(pageKey) === shouldContain) {
    return pages;
  }
  const next = new Set(pages);
  if (shouldContain) {
    next.add(pageKey);
  } else {
    next.delete(pageKey);
  }
  return next;
};

const replacePageSet = (pages: Set<string>, nextPages: Set<string>): Set<string> => {
  if (pages.size === nextPages.size && [...nextPages].every((pageKey) => pages.has(pageKey))) {
    return pages;
  }
  return nextPages;
};

interface ValidationContextType {
  pagesWithErrors: Set<string>;
  summaryVisible: boolean;
  validatePage: (pageKey: string, components: Component[]) => boolean;
  validatePages: (pages: ValidationPage[]) => boolean;
  getError: (submissionPath: string, pageKey: string, components: Component[]) => string | undefined;
  getErrorsForPage: (pageKey: string, components: Component[]) => FieldError[];
  getErrorsForPages: (pages: ValidationPage[]) => FieldError[];
  handleFieldChange: (pageKey: string, components: Component[], nextSubmission: Submission | undefined) => void;
  hasErrorState: (pageKey: string) => boolean;
  hideSummary: () => void;
  shouldShowSummaryForPage: (pageKey: string) => boolean;
  shouldShowSummaryForSummaryPage: () => boolean;
  syncPageValidationState: (pageKey: string, components: Component[]) => void;
}

interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
}

const ValidationContext = createContext<ValidationContextType>({} as ValidationContextType);

const ValidationProvider = ({ children, initialPagesWithErrors }: Props) => {
  const { currentLanguage, translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { config, submissionMethod } = useAppConfig();
  const allowTestTypes = config?.NAIS_CLUSTER_NAME !== 'prod-gcp';
  const [pagesWithErrors, setPagesWithErrors] = useState<Set<string>>(() => new Set(initialPagesWithErrors ?? []));
  const [summaryScope, setSummaryScope] = useState<SummaryScope>(undefined);

  const computeErrors = useCallback(
    (pageKey: string, components: Component[], activeSubmission: Submission | undefined): FieldError[] =>
      deriveValidations(components, activeSubmission, submissionMethod).reduce<FieldError[]>(
        (acc, { submissionPath, field, rules }) => {
          const violation = validateValue(
            submissionUtils.getSubmissionValue(submissionPath, activeSubmission),
            field,
            rules,
            currentLanguage,
            { allowTestTypes },
          );
          if (violation) {
            acc.push({ pageKey, submissionPath, field, message: translate(violation.textKey, violation.params) });
          }
          return acc;
        },
        [],
      ),
    [allowTestTypes, currentLanguage, submissionMethod, translate],
  );

  const getErrorsForPage = useCallback(
    (pageKey: string, components: Component[]) => computeErrors(pageKey, components, submission),
    [computeErrors, submission],
  );

  const getErrorsForPages = useCallback(
    (pages: ValidationPage[]) =>
      pages.flatMap(({ pageKey, components }) => computeErrors(pageKey, components, submission)),
    [computeErrors, submission],
  );

  const validatePage = useCallback(
    (pageKey: string, components: Component[]) => {
      const pageErrors = computeErrors(pageKey, components, submission);
      setPagesWithErrors((prev) => togglePageInSet(prev, pageKey, pageErrors.length > 0));
      setSummaryScope(pageErrors.length > 0 ? { type: 'page', pageKey } : undefined);
      return pageErrors.length === 0;
    },
    [computeErrors, submission],
  );

  const validatePages = useCallback(
    (pages: ValidationPage[]) => {
      const failedPages = new Set<string>();
      pages.forEach(({ pageKey, components }) => {
        const pageErrors = computeErrors(pageKey, components, submission);
        if (pageErrors.length > 0) failedPages.add(pageKey);
      });
      setPagesWithErrors((prev) => replacePageSet(prev, failedPages));
      setSummaryScope(failedPages.size > 0 ? { type: 'summary' } : undefined);
      return failedPages.size === 0;
    },
    [computeErrors, submission],
  );

  const getError = useCallback(
    (submissionPath: string, pageKey: string, components: Component[]) => {
      if (!pagesWithErrors.has(pageKey)) {
        return undefined;
      }
      return getErrorsForPage(pageKey, components).find((error) => error.submissionPath === submissionPath)?.message;
    },
    [getErrorsForPage, pagesWithErrors],
  );

  const hasErrorState = useCallback((pageKey: string) => pagesWithErrors.has(pageKey), [pagesWithErrors]);
  const hideSummary = useCallback(() => setSummaryScope(undefined), []);
  const shouldShowSummaryForPage = useCallback(
    (pageKey: string) => summaryScope?.type === 'page' && summaryScope.pageKey === pageKey,
    [summaryScope],
  );
  const shouldShowSummaryForSummaryPage = useCallback(() => summaryScope?.type === 'summary', [summaryScope]);

  const updatePageValidationState = useCallback(
    (pageKey: string, components: Component[], activeSubmission: Submission | undefined) => {
      const pageErrors = computeErrors(pageKey, components, activeSubmission);
      setPagesWithErrors((prev) => togglePageInSet(prev, pageKey, pageErrors.length > 0));
      setSummaryScope((prev) => {
        if (prev?.type === 'page' && prev.pageKey === pageKey) {
          return pageErrors.length > 0 ? prev : undefined;
        }
        return prev;
      });
    },
    [computeErrors],
  );

  const handleFieldChange = useCallback(
    (pageKey: string, components: Component[], nextSubmission: Submission | undefined) => {
      if (!pagesWithErrors.has(pageKey) && !(summaryScope?.type === 'page' && summaryScope.pageKey === pageKey)) {
        return;
      }
      updatePageValidationState(pageKey, components, nextSubmission);
    },
    [pagesWithErrors, summaryScope, updatePageValidationState],
  );

  const syncPageValidationState = useCallback(
    (pageKey: string, components: Component[]) => {
      if (!pagesWithErrors.has(pageKey) && !(summaryScope?.type === 'page' && summaryScope.pageKey === pageKey)) {
        return;
      }
      updatePageValidationState(pageKey, components, submission);
    },
    [pagesWithErrors, submission, summaryScope, updatePageValidationState],
  );

  const value = useMemo(
    () => ({
      pagesWithErrors,
      summaryVisible: summaryScope !== undefined,
      validatePage,
      validatePages,
      getError,
      getErrorsForPage,
      getErrorsForPages,
      handleFieldChange,
      hasErrorState,
      hideSummary,
      shouldShowSummaryForPage,
      shouldShowSummaryForSummaryPage,
      syncPageValidationState,
    }),
    [
      pagesWithErrors,
      summaryScope,
      validatePage,
      validatePages,
      getError,
      getErrorsForPage,
      getErrorsForPages,
      handleFieldChange,
      hasErrorState,
      hideSummary,
      shouldShowSummaryForPage,
      shouldShowSummaryForSummaryPage,
      syncPageValidationState,
    ],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
};

const useValidation = () => useContext(ValidationContext);

export { useValidation, ValidationProvider };
export type { FieldError, ValidationContextType };

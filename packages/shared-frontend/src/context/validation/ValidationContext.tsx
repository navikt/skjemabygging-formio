import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ComponentDefinition } from '../../form-components/component-types';
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { useSubmissionMethod } from '../submission-method/SubmissionMethodContext';
import { attachmentValidationPath, createPageErrorCalculator } from './validationErrors';
import { AttachmentField, ExternalAttachmentError, FieldError } from './validationTypes';

type ValidationPage = { pageKey: string; components: ComponentDefinition[] };
type SummaryScope = { type: 'page'; pageKey: string } | { type: 'summary' } | undefined;
type PageErrorsByKey = Record<string, FieldError[]>;

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

const areFieldErrorsEqual = (errors: FieldError[] | undefined, nextErrors: FieldError[]): boolean =>
  (errors ?? []).length === nextErrors.length &&
  nextErrors.every((error, index) => {
    const existingError = errors?.[index];
    return (
      existingError?.pageKey === error.pageKey &&
      existingError.submissionPath === error.submissionPath &&
      existingError.field === error.field &&
      existingError.message === error.message
    );
  });

const setPageErrors = (pageErrorsByKey: PageErrorsByKey, pageKey: string, errors: FieldError[]): PageErrorsByKey => {
  if (errors.length === 0) {
    if (!(pageKey in pageErrorsByKey)) {
      return pageErrorsByKey;
    }

    const { [pageKey]: _removedPageErrors, ...remainingPageErrors } = pageErrorsByKey;
    return remainingPageErrors;
  }

  if (areFieldErrorsEqual(pageErrorsByKey[pageKey], errors)) {
    return pageErrorsByKey;
  }

  return {
    ...pageErrorsByKey,
    [pageKey]: errors,
  };
};

interface ValidationContextType {
  pagesWithErrors: Set<string>;
  summaryVisible: boolean;
  summaryFocusRequest: number;
  validatePage: (pageKey: string, components: ComponentDefinition[]) => boolean;
  validatePages: (pages: ValidationPage[]) => string[];
  getError: (submissionPath: string, pageKey: string, components: ComponentDefinition[]) => string | undefined;
  getErrorsForPage: (pageKey: string, components: ComponentDefinition[]) => FieldError[];
  getErrorsForPages: (pages: ValidationPage[]) => FieldError[];
  handleFieldChange: (
    pageKey: string,
    components: ComponentDefinition[],
    nextSubmission: Submission | undefined,
  ) => void;
  hasErrorState: (pageKey: string) => boolean;
  hideSummary: () => void;
  shouldShowSummaryForPage: (pageKey: string) => boolean;
  shouldShowSummaryForSummaryPage: () => boolean;
  syncPageValidationState: (pageKey: string, components: ComponentDefinition[]) => void;
  setAttachmentExternalError: (
    attachmentId: string,
    field: AttachmentField,
    message?: string,
    pageKey?: string,
  ) => void;
  getAttachmentExternalError: (attachmentId: string, field: AttachmentField) => string | undefined;
}

interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
}

const ValidationContext = createContext<ValidationContextType>({} as ValidationContextType);

const ValidationProvider = ({ children, initialPagesWithErrors }: Props) => {
  const { currentLanguage, translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { environment } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const allowTestTypes = environment !== 'production';
  const [pagesWithErrors, setPagesWithErrors] = useState<Set<string>>(() => new Set(initialPagesWithErrors ?? []));
  const [pageErrorsByKey, setPageErrorsByKey] = useState<PageErrorsByKey>({});
  const [summaryScope, setSummaryScope] = useState<SummaryScope>(undefined);
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);
  const [externalAttachmentErrors, setExternalAttachmentErrors] = useState<Record<string, ExternalAttachmentError>>({});

  const computeErrors = useMemo(
    () =>
      createPageErrorCalculator({
        allowTestTypes,
        currentLanguage,
        externalAttachmentErrors,
        submissionMethod,
        translate,
      }),
    [allowTestTypes, currentLanguage, externalAttachmentErrors, submissionMethod, translate],
  );

  const setAttachmentExternalError = useCallback(
    (attachmentId: string, field: AttachmentField, message?: string, pageKey?: string) => {
      const key = attachmentValidationPath(attachmentId, field);
      setExternalAttachmentErrors((previous) => {
        if (!message) {
          if (!(key in previous)) {
            return previous;
          }
          const { [key]: _removedError, ...remainingErrors } = previous;
          return remainingErrors;
        }

        const nextError = { attachmentId, field, message };
        const currentError = previous[key];
        return currentError?.message === message ? previous : { ...previous, [key]: nextError };
      });
      if (message && pageKey) {
        setSummaryScope({ type: 'page', pageKey });
      }
    },
    [],
  );

  const getAttachmentExternalError = useCallback(
    (attachmentId: string, field: AttachmentField) =>
      externalAttachmentErrors[attachmentValidationPath(attachmentId, field)]?.message,
    [externalAttachmentErrors],
  );

  const getErrorsForPage = useCallback(
    (pageKey: string, components: ComponentDefinition[]) =>
      pageErrorsByKey[pageKey] ?? computeErrors(pageKey, components, submission),
    [computeErrors, pageErrorsByKey, submission],
  );

  const getErrorsForPages = useCallback(
    (pages: ValidationPage[]) =>
      pages.flatMap(
        ({ pageKey, components }) => pageErrorsByKey[pageKey] ?? computeErrors(pageKey, components, submission),
      ),
    [computeErrors, pageErrorsByKey, submission],
  );

  const validatePage = useCallback(
    (pageKey: string, components: ComponentDefinition[]) => {
      const pageErrors = computeErrors(pageKey, components, submission);
      setPagesWithErrors((prev) => togglePageInSet(prev, pageKey, pageErrors.length > 0));
      setPageErrorsByKey((prev) => setPageErrors(prev, pageKey, pageErrors));
      setSummaryScope(pageErrors.length > 0 ? { type: 'page', pageKey } : undefined);
      if (pageErrors.length > 0) {
        setSummaryFocusRequest((previous) => previous + 1);
      }
      return pageErrors.length === 0;
    },
    [computeErrors, submission],
  );

  const validatePages = useCallback(
    (pages: ValidationPage[]) => {
      const failedPages = new Set<string>();
      const pageErrors = new Map<string, FieldError[]>();
      pages.forEach(({ pageKey, components }) => {
        const errors = computeErrors(pageKey, components, submission);
        pageErrors.set(pageKey, errors);
        if (errors.length > 0) failedPages.add(pageKey);
      });
      setPagesWithErrors((prev) => replacePageSet(prev, failedPages));
      setPageErrorsByKey((prev) => {
        return pages.reduce((acc, { pageKey }) => setPageErrors(acc, pageKey, pageErrors.get(pageKey) ?? []), prev);
      });
      setSummaryScope(failedPages.size > 0 ? { type: 'summary' } : undefined);
      if (failedPages.size > 0) {
        setSummaryFocusRequest((previous) => previous + 1);
      }
      return Array.from(failedPages);
    },
    [computeErrors, submission],
  );

  const getError = useCallback(
    (submissionPath: string, pageKey: string, components: ComponentDefinition[]) => {
      if (!pagesWithErrors.has(pageKey)) {
        return undefined;
      }
      return (pageErrorsByKey[pageKey] ?? getErrorsForPage(pageKey, components)).find(
        (error) => error.submissionPath === submissionPath,
      )?.message;
    },
    [getErrorsForPage, pageErrorsByKey, pagesWithErrors],
  );

  const hasErrorState = useCallback((pageKey: string) => pagesWithErrors.has(pageKey), [pagesWithErrors]);
  const hideSummary = useCallback(() => setSummaryScope(undefined), []);
  const shouldShowSummaryForPage = useCallback(
    (pageKey: string) => summaryScope?.type === 'page' && summaryScope.pageKey === pageKey,
    [summaryScope],
  );
  const shouldShowSummaryForSummaryPage = useCallback(() => summaryScope?.type === 'summary', [summaryScope]);

  const updatePageValidationState = useCallback(
    (pageKey: string, components: ComponentDefinition[], activeSubmission: Submission | undefined) => {
      const pageErrors = computeErrors(pageKey, components, activeSubmission);
      setPagesWithErrors((prev) => togglePageInSet(prev, pageKey, pageErrors.length > 0));
      setPageErrorsByKey((prev) => setPageErrors(prev, pageKey, pageErrors));
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
    (pageKey: string, components: ComponentDefinition[], nextSubmission: Submission | undefined) => {
      if (!pagesWithErrors.has(pageKey) && !(summaryScope?.type === 'page' && summaryScope.pageKey === pageKey)) {
        return;
      }
      updatePageValidationState(pageKey, components, nextSubmission);
    },
    [pagesWithErrors, summaryScope, updatePageValidationState],
  );

  const syncPageValidationState = useCallback(
    (pageKey: string, components: ComponentDefinition[]) => {
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
      summaryFocusRequest,
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
      setAttachmentExternalError,
      getAttachmentExternalError,
    }),
    [
      pagesWithErrors,
      summaryScope,
      summaryFocusRequest,
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
      setAttachmentExternalError,
      getAttachmentExternalError,
    ],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
};

const useValidation = () => useContext(ValidationContext);

export { attachmentValidationPath, useValidation, ValidationProvider };
export type { AttachmentField, FieldError, ValidationContextType };

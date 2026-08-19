import {
  Component,
  navFormUtils,
  Submission,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { deriveValidations } from '../../validation/deriveValidations';
import { validateValue } from '../../validation/validators';
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { useSubmissionMethod } from '../submission-method/SubmissionMethodContext';

interface FieldError {
  pageKey: string;
  submissionPath: string;
  field: string;
  message: string;
}

interface RuleViolation {
  textKey: string;
  params: Record<string, string | number>;
}

type AttachmentField = 'value' | 'files' | 'title';
type AttachmentViolation = { submissionPath: string; violation: RuleViolation };
type ExternalAttachmentError = { attachmentId: string; field: AttachmentField; message: string };

const attachmentValidationPath = (attachmentId: string, field: AttachmentField) =>
  `attachments.${attachmentId}.${field}`;

const getTranslationKey = (textKey: string) =>
  Object.entries(TEXTS.validering).find(([, text]) => text === textKey)?.[0] ?? textKey;

const validateAttachmentComponent = (
  component: Component,
  field: string,
  activeSubmission: Submission | undefined,
  submissionMethod?: string,
): AttachmentViolation[] => {
  if (submissionMethod === 'paper' || submissionMethod === 'papernocoverpage' || submissionMethod === undefined) {
    return [];
  }

  const attachmentId = navFormUtils.getNavId(component);
  if (!attachmentId) {
    return [];
  }

  const attachments =
    activeSubmission?.attachments?.filter((currentAttachment) => currentAttachment.navId === attachmentId) ?? [];
  const primaryAttachment = attachments[0];
  const violations: AttachmentViolation[] = [];

  if (component.validate?.required && !primaryAttachment?.value) {
    violations.push({
      submissionPath: attachmentValidationPath(attachmentId, 'value'),
      violation: { textKey: TEXTS.validering.required, params: { field } },
    });
  }

  attachments
    .filter((attachment) => attachment.value === 'leggerVedNaa')
    .forEach((attachment) => {
      if ((attachment.files ?? []).length === 0) {
        violations.push({
          submissionPath: attachmentValidationPath(attachment.attachmentId, 'files'),
          violation: { textKey: 'fileMissing', params: { field } },
        });
      }
    });

  return violations;
};

type ValidationPage = { pageKey: string; components: Component[] };
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
  validatePage: (pageKey: string, components: Component[]) => boolean;
  validatePages: (pages: ValidationPage[]) => string[];
  getError: (submissionPath: string, pageKey: string, components: Component[]) => string | undefined;
  getErrorsForPage: (pageKey: string, components: Component[]) => FieldError[];
  getErrorsForPages: (pages: ValidationPage[]) => FieldError[];
  handleFieldChange: (pageKey: string, components: Component[], nextSubmission: Submission | undefined) => void;
  hasErrorState: (pageKey: string) => boolean;
  hideSummary: () => void;
  shouldShowSummaryForPage: (pageKey: string) => boolean;
  shouldShowSummaryForSummaryPage: () => boolean;
  syncPageValidationState: (pageKey: string, components: Component[]) => void;
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
  const [externalAttachmentErrors, setExternalAttachmentErrors] = useState<Record<string, ExternalAttachmentError>>({});

  const computeErrors = useCallback(
    (pageKey: string, components: Component[], activeSubmission: Submission | undefined): FieldError[] => {
      const derivedErrors = deriveValidations(components, activeSubmission, submissionMethod).reduce<FieldError[]>(
        (acc, { submissionPath, field, rules, component }) => {
          if (
            component?.type === 'attachment' &&
            (submissionMethod === 'digital' || submissionMethod === 'digitalnologin')
          ) {
            validateAttachmentComponent(component, field, activeSubmission, submissionMethod).forEach(
              ({ submissionPath: attachmentSubmissionPath, violation }) => {
                acc.push({
                  pageKey,
                  submissionPath: attachmentSubmissionPath,
                  field,
                  message: translate(getTranslationKey(violation.textKey), {
                    ...violation.params,
                    ...(typeof violation.params.field === 'string' && { field: translate(violation.params.field) }),
                  }),
                });
              },
            );
            return acc;
          }

          const violation = validateValue(
            submissionUtils.getSubmissionValue(submissionPath, activeSubmission),
            field,
            rules,
            currentLanguage,
            {
              allowTestTypes,
              submission: activeSubmission,
              submissionPath,
            },
          );
          if (violation) {
            acc.push({
              pageKey,
              submissionPath,
              field,
              message: translate(getTranslationKey(violation.textKey), {
                ...violation.params,
                ...(typeof violation.params.field === 'string' && { field: translate(violation.params.field) }),
              }),
            });
          }
          return acc;
        },
        [],
      );
      const attachmentIds = new Set(
        navFormUtils
          .flattenComponents(components)
          .filter((component) => component.type === 'attachment')
          .map((component) => navFormUtils.getNavId(component))
          .filter((attachmentId): attachmentId is string => !!attachmentId),
      );
      const uploadErrors = Object.values(externalAttachmentErrors)
        .filter((error) =>
          [...attachmentIds].some(
            (attachmentId) => error.attachmentId === attachmentId || error.attachmentId.startsWith(`${attachmentId}-`),
          ),
        )
        .map(({ attachmentId, field, message }) => ({
          pageKey,
          submissionPath: attachmentValidationPath(attachmentId, field),
          field: '',
          message,
        }));

      return [...derivedErrors, ...uploadErrors];
    },
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
    (pageKey: string, components: Component[]) =>
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
    (pageKey: string, components: Component[]) => {
      const pageErrors = computeErrors(pageKey, components, submission);
      setPagesWithErrors((prev) => togglePageInSet(prev, pageKey, pageErrors.length > 0));
      setPageErrorsByKey((prev) => setPageErrors(prev, pageKey, pageErrors));
      setSummaryScope(pageErrors.length > 0 ? { type: 'page', pageKey } : undefined);
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
      return Array.from(failedPages);
    },
    [computeErrors, submission],
  );

  const getError = useCallback(
    (submissionPath: string, pageKey: string, components: Component[]) => {
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
    (pageKey: string, components: Component[], activeSubmission: Submission | undefined) => {
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
      setAttachmentExternalError,
      getAttachmentExternalError,
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
      setAttachmentExternalError,
      getAttachmentExternalError,
    ],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
};

const useValidation = () => useContext(ValidationContext);

export { attachmentValidationPath, useValidation, ValidationProvider };
export type { AttachmentField, FieldError, ValidationContextType };

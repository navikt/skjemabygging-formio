import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { validateValue } from '../../validation/validators';
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { attachmentValidationPath } from './attachmentValidationPath';
import {
  AttachmentField,
  ExternalAttachmentError,
  FieldError,
  FieldViolation,
  ValidationField,
} from './validationTypes';

type SummaryScope = { type: 'page'; pageKey: string } | { type: 'summary' } | undefined;
type PageViolationsByKey = Record<string, FieldViolation[]>;

const toFieldError = (translate: TranslateFunction, fieldViolation: FieldViolation): FieldError => {
  const { violation, message, ...error } = fieldViolation;
  return {
    ...error,
    message: violation
      ? translate(violation.textKey, {
          ...violation.params,
          ...(typeof violation.params.field === 'string' && { field: translate(violation.params.field) }),
        })
      : (message ?? ''),
  };
};

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

const areViolationsEqual = (violations: FieldViolation[] | undefined, nextViolations: FieldViolation[]): boolean =>
  (violations ?? []).length === nextViolations.length &&
  nextViolations.every((nextViolation, index) => {
    const violation = violations?.[index];
    return (
      violation?.pageKey === nextViolation.pageKey &&
      violation.submissionPath === nextViolation.submissionPath &&
      violation.field === nextViolation.field &&
      violation.message === nextViolation.message &&
      violation.violation?.textKey === nextViolation.violation?.textKey &&
      JSON.stringify(violation.violation?.params) === JSON.stringify(nextViolation.violation?.params)
    );
  });

const setPageViolations = (
  violationsByPage: PageViolationsByKey,
  pageKey: string,
  violations: FieldViolation[],
): PageViolationsByKey => {
  if (violations.length === 0) {
    if (!(pageKey in violationsByPage)) {
      return violationsByPage;
    }
    const { [pageKey]: _removedPageViolations, ...remainingViolations } = violationsByPage;
    return remainingViolations;
  }
  if (areViolationsEqual(violationsByPage[pageKey], violations)) {
    return violationsByPage;
  }
  return { ...violationsByPage, [pageKey]: violations };
};

interface ValidationContextType {
  pagesWithErrors: Set<string>;
  summaryVisible: boolean;
  summaryFocusRequest: number;
  /**
   * Register (or replace) the validated field at `statePath`. Called by the input that renders the
   * value (`useStateField`) or, for a path with no input of its own, by `ValidationRegistration` -
   * never from generic form-definition code.
   */
  registerField: (pageKey: string, field: ValidationField) => void;
  unregisterField: (pageKey: string, statePath: string) => void;
  updateFieldValue: (pageKey: string, statePath: string, value: unknown) => void;
  resetPageFields: (pageKey: string) => void;
  validatePage: (pageKey: string) => boolean;
  validatePages: (pageKeys: string[]) => string[];
  getError: (submissionPath: string, pageKey: string) => string | undefined;
  getErrorsForPage: (pageKey: string) => FieldError[];
  getErrorsForPages: (pageKeys: string[]) => FieldError[];
  handleFieldChange: (pageKey: string) => void;
  hasErrorState: (pageKey: string) => boolean;
  hideSummary: () => void;
  shouldShowSummaryForPage: (pageKey: string) => boolean;
  shouldShowSummaryForSummaryPage: () => boolean;
  syncPageValidationState: (pageKey: string) => void;
  setAttachmentExternalError: (
    attachmentId: string,
    field: AttachmentField,
    message?: string,
    pageKey?: string,
  ) => void;
  getAttachmentExternalError: (attachmentId: string, field: AttachmentField) => string | undefined;
}

/**
 * Rebuilds the fields of a page from the current state. Injected by the surface that owns the form
 * definition (fyllut), so generic validation never inspects one itself. Returning `undefined` falls
 * back to the fields the rendered components registered.
 */
type PageFieldsResolver = (pageKey: string) => ValidationField[] | undefined;

interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
  resolvePageFields?: PageFieldsResolver;
}

const ValidationContext = createContext<ValidationContextType>({} as ValidationContextType);

/**
 * Holds validation state for a form: the fields validated per page, the resulting errors and the
 * error summary/focus state.
 *
 * Fields are described generically (`{ statePath, value, field, rules }`), so validation never
 * inspects a form definition and never evaluates form scripts. There are two sources for them:
 *  - `resolvePageFields`, injected by the surface that owns the form definition. It rebuilds a page
 *    from the current state on demand, which is what makes a page the user never opened - or a page
 *    whose fields a later page's condition changed - validate correctly.
 *  - the registrations made by the components that render the fields, used when no resolver is
 *    injected. Exactly one component registers each state path. Registrations survive a page
 *    unmount on purpose, while a field that stops rendering inside a mounted page unregisters
 *    itself.
 */
const ValidationProvider = ({ children, initialPagesWithErrors, resolvePageFields }: Props) => {
  const { currentLanguage, translate } = useLanguage();
  const { environment } = useApplication();
  const allowTestTypes = environment !== 'production';
  const fieldsByPageRef = useRef(new Map<string, Map<string, ValidationField>>());
  const [pagesWithErrors, setPagesWithErrors] = useState<Set<string>>(() => new Set(initialPagesWithErrors ?? []));
  const pagesWithErrorsRef = useRef(pagesWithErrors);
  const [violationsByPage, setViolationsByPage] = useState<PageViolationsByKey>({});
  const [summaryScope, setSummaryScope] = useState<SummaryScope>(undefined);
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);
  const [externalAttachmentErrors, setExternalAttachmentErrors] = useState<Record<string, ExternalAttachmentError>>({});
  // Pages whose registrations or values changed during the current commit. They are refreshed from
  // an effect that runs after the field effects, so a page is never evaluated half-registered.
  const dirtyPagesRef = useRef(new Set<string>());
  const [dirtyVersion, setDirtyVersion] = useState(0);
  // With a resolver, a page is always rebuilt from the current state, so reading a stored violation
  // could show an error that a change on another page has already resolved.
  const derivesFieldsFromState = resolvePageFields !== undefined;

  // The resolver must stay identity-stable across value changes - it reads the current state itself
  // rather than closing over it - or it would churn the context identity (see the
  // no-re-render-loops invariant).
  const getPageFields = useCallback(
    (pageKey: string): ValidationField[] =>
      resolvePageFields?.(pageKey) ?? [...(fieldsByPageRef.current.get(pageKey)?.values() ?? [])],
    [resolvePageFields],
  );

  const computeViolations = useCallback(
    (pageKey: string): FieldViolation[] => {
      const fieldViolations = getPageFields(pageKey).flatMap(({ statePath, value, field, rules }) => {
        const violation = validateValue(value, field, rules, currentLanguage, { allowTestTypes });
        return violation ? [{ pageKey, submissionPath: statePath, field, violation }] : [];
      });
      const attachmentViolations = Object.values(externalAttachmentErrors)
        .filter((error) => error.pageKey === pageKey)
        .map(({ attachmentId, field, message }) => ({
          pageKey,
          submissionPath: attachmentValidationPath(attachmentId, field),
          field: '',
          message,
        }));
      return [...fieldViolations, ...attachmentViolations];
    },
    [allowTestTypes, currentLanguage, externalAttachmentErrors, getPageFields],
  );

  const computeErrors = useCallback(
    (pageKey: string): FieldError[] =>
      computeViolations(pageKey).map((violation) => toFieldError(translate, violation)),
    [computeViolations, translate],
  );

  const setPageState = useCallback((pageKey: string, violations: FieldViolation[]) => {
    setPagesWithErrors((previous) => {
      const next = togglePageInSet(previous, pageKey, violations.length > 0);
      pagesWithErrorsRef.current = next;
      return next;
    });
    setViolationsByPage((previous) => setPageViolations(previous, pageKey, violations));
  }, []);

  const updatePageValidationState = useCallback(
    (pageKey: string) => {
      const violations = computeViolations(pageKey);
      setPageState(pageKey, violations);
      setSummaryScope((previous) =>
        previous?.type === 'page' && previous.pageKey === pageKey && violations.length === 0 ? undefined : previous,
      );
    },
    [computeViolations, setPageState],
  );

  // Only pages that already show errors need refreshing: a page without error state has nothing
  // rendered to keep in sync and is evaluated from scratch when it is validated.
  const markPageDirty = useCallback((pageKey: string) => {
    if (!pagesWithErrorsRef.current.has(pageKey)) {
      return;
    }
    dirtyPagesRef.current.add(pageKey);
    setDirtyVersion((previous) => previous + 1);
  }, []);

  const registerField = useCallback(
    (pageKey: string, field: ValidationField) => {
      const pageFields = fieldsByPageRef.current.get(pageKey) ?? new Map<string, ValidationField>();
      pageFields.set(field.statePath, field);
      fieldsByPageRef.current.set(pageKey, pageFields);
      markPageDirty(pageKey);
    },
    [markPageDirty],
  );

  const unregisterField = useCallback(
    (pageKey: string, statePath: string) => {
      if (fieldsByPageRef.current.get(pageKey)?.delete(statePath)) {
        markPageDirty(pageKey);
      }
    },
    [markPageDirty],
  );

  const updateFieldValue = useCallback(
    (pageKey: string, statePath: string, value: unknown) => {
      const field = fieldsByPageRef.current.get(pageKey)?.get(statePath);
      if (field && !Object.is(field.value, value)) {
        field.value = value;
        markPageDirty(pageKey);
      }
    },
    [markPageDirty],
  );

  const resetPageFields = useCallback((pageKey: string) => {
    fieldsByPageRef.current.set(pageKey, new Map());
  }, []);

  useEffect(() => {
    if (dirtyPagesRef.current.size === 0) {
      return;
    }
    const pageKeys = [...dirtyPagesRef.current];
    dirtyPagesRef.current.clear();
    pageKeys.filter((pageKey) => pagesWithErrorsRef.current.has(pageKey)).forEach(updatePageValidationState);
  }, [dirtyVersion, updatePageValidationState]);

  const validatePage = useCallback(
    (pageKey: string) => {
      const violations = computeViolations(pageKey);
      setPageState(pageKey, violations);
      setSummaryScope(violations.length > 0 ? { type: 'page', pageKey } : undefined);
      if (violations.length > 0) {
        setSummaryFocusRequest((previous) => previous + 1);
      }
      return violations.length === 0;
    },
    [computeViolations, setPageState],
  );

  const validatePages = useCallback(
    (pageKeys: string[]) => {
      const failedPages = new Set<string>();
      const violationsByPageKey = new Map<string, FieldViolation[]>();
      pageKeys.forEach((pageKey) => {
        const violations = computeViolations(pageKey);
        violationsByPageKey.set(pageKey, violations);
        if (violations.length > 0) {
          failedPages.add(pageKey);
        }
      });
      setPagesWithErrors((previous) => {
        const next = replacePageSet(previous, failedPages);
        pagesWithErrorsRef.current = next;
        return next;
      });
      setViolationsByPage((previous) =>
        pageKeys.reduce(
          (next, pageKey) => setPageViolations(next, pageKey, violationsByPageKey.get(pageKey) ?? []),
          previous,
        ),
      );
      setSummaryScope(failedPages.size > 0 ? { type: 'summary' } : undefined);
      if (failedPages.size > 0) {
        setSummaryFocusRequest((previous) => previous + 1);
      }
      return [...failedPages];
    },
    [computeViolations],
  );

  // Messages are worded here rather than when they are stored, so they always follow the language
  // the user is reading the form in.
  const errorsByPage = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(violationsByPage).map(([pageKey, violations]) => [
          pageKey,
          violations.map((violation) => toFieldError(translate, violation)),
        ]),
      ),
    [translate, violationsByPage],
  );

  const errorsFor = useCallback(
    (pageKey: string) =>
      derivesFieldsFromState ? computeErrors(pageKey) : (errorsByPage[pageKey] ?? computeErrors(pageKey)),
    [computeErrors, derivesFieldsFromState, errorsByPage],
  );
  const getErrorsForPage = useCallback((pageKey: string) => errorsFor(pageKey), [errorsFor]);
  const getErrorsForPages = useCallback(
    (pageKeys: string[]) => pageKeys.flatMap((pageKey) => errorsFor(pageKey)),
    [errorsFor],
  );
  const getError = useCallback(
    (submissionPath: string, pageKey: string) =>
      pagesWithErrors.has(pageKey)
        ? errorsFor(pageKey).find((error) => error.submissionPath === submissionPath)?.message
        : undefined,
    [errorsFor, pagesWithErrors],
  );
  const handleFieldChange = useCallback(
    (pageKey: string) => {
      if (pagesWithErrorsRef.current.has(pageKey)) {
        updatePageValidationState(pageKey);
      }
    },
    [updatePageValidationState],
  );
  const syncPageValidationState = handleFieldChange;
  const hasErrorState = useCallback((pageKey: string) => pagesWithErrors.has(pageKey), [pagesWithErrors]);
  const hideSummary = useCallback(() => setSummaryScope(undefined), []);
  const shouldShowSummaryForPage = useCallback(
    (pageKey: string) => summaryScope?.type === 'page' && summaryScope.pageKey === pageKey,
    [summaryScope],
  );
  const shouldShowSummaryForSummaryPage = useCallback(() => summaryScope?.type === 'summary', [summaryScope]);

  const setAttachmentExternalError = useCallback(
    (attachmentId: string, field: AttachmentField, message?: string, pageKey?: string) => {
      const key = attachmentValidationPath(attachmentId, field);
      const attachmentPathPrefix = `attachments.${attachmentId}.`;
      const inferredPageKey =
        pageKey ??
        externalAttachmentErrors[key]?.pageKey ??
        [...fieldsByPageRef.current.entries()].find(([, fields]) =>
          [...fields.keys()].some((statePath) => statePath.startsWith(attachmentPathPrefix)),
        )?.[0];
      setExternalAttachmentErrors((previous) => {
        if (!message) {
          if (!(key in previous)) {
            return previous;
          }
          const { [key]: _removedError, ...remainingErrors } = previous;
          return remainingErrors;
        }
        const nextError = { attachmentId, field, message, pageKey: inferredPageKey };
        const currentError = previous[key];
        return currentError?.message === message && currentError.pageKey === inferredPageKey
          ? previous
          : { ...previous, [key]: nextError };
      });
      if (inferredPageKey) {
        markPageDirty(inferredPageKey);
      }
      if (message && inferredPageKey) {
        setSummaryScope({ type: 'page', pageKey: inferredPageKey });
      }
    },
    [externalAttachmentErrors, markPageDirty],
  );
  const getAttachmentExternalError = useCallback(
    (attachmentId: string, field: AttachmentField) =>
      externalAttachmentErrors[attachmentValidationPath(attachmentId, field)]?.message,
    [externalAttachmentErrors],
  );

  const value = useMemo(
    () => ({
      pagesWithErrors,
      summaryVisible: summaryScope !== undefined,
      summaryFocusRequest,
      registerField,
      unregisterField,
      updateFieldValue,
      resetPageFields,
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
      getAttachmentExternalError,
      getError,
      getErrorsForPage,
      getErrorsForPages,
      handleFieldChange,
      hasErrorState,
      hideSummary,
      pagesWithErrors,
      registerField,
      resetPageFields,
      setAttachmentExternalError,
      shouldShowSummaryForPage,
      shouldShowSummaryForSummaryPage,
      summaryFocusRequest,
      summaryScope,
      syncPageValidationState,
      unregisterField,
      updateFieldValue,
      validatePage,
      validatePages,
    ],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
};

const useValidation = () => useContext(ValidationContext);

export { attachmentValidationPath, useValidation, ValidationProvider };
export type { AttachmentField, FieldError, PageFieldsResolver, ValidationContextType, ValidationField };

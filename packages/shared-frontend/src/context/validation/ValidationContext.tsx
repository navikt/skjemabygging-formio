import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { validateValue } from '../../validation/validators';
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { attachmentValidationPath } from './attachmentValidationPath';
import { ErrorSummaryScope, PageFieldsResolver, ValidationContextValue } from './validationContextTypes';
import { PageViolationsByKey, replacePageSet, setPageViolations, togglePageInSet } from './validationState';
import { ValidationContext, ValidationStore } from './validationStore';
import {
  AttachmentField,
  ExternalAttachmentError,
  FieldError,
  FieldViolation,
  ValidationField,
} from './validationTypes';

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

/**
 * Rebuilds the fields of a page from the current state. Injected by the surface that owns the form
 * definition (fyllut), so generic validation never inspects one itself. Returning `undefined` falls
 * back to the fields the rendered components registered.
 */
interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
  resolvePageFields?: PageFieldsResolver;
}

interface CachedPageValidation {
  fieldSource?: object;
  registeredFieldsRevision: number;
  externalAttachmentErrors: Record<string, ExternalAttachmentError>;
  currentLanguage: string;
  allowTestTypes: boolean;
  translate: TranslateFunction;
  violations: FieldViolation[];
  errors: FieldError[];
}

interface CachedPageErrors {
  violations?: FieldViolation[];
  translate: TranslateFunction;
  errors: FieldError[];
}

interface CachedCombinedErrors {
  pageErrors: FieldError[][];
  errors: FieldError[];
}

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
  const registeredFieldsRevisionRef = useRef(new Map<string, number>());
  const pageValidationCacheRef = useRef(new Map<string, CachedPageValidation>());
  const storedErrorsCacheRef = useRef(new Map<string, CachedPageErrors>());
  const combinedErrorsCacheRef = useRef(new Map<string, CachedCombinedErrors>());
  const [pagesWithErrors, setPagesWithErrors] = useState<Set<string>>(() => new Set(initialPagesWithErrors ?? []));
  const pagesWithErrorsRef = useRef(pagesWithErrors);
  const [violationsByPage, setViolationsByPage] = useState<PageViolationsByKey>({});
  const [errorSummaryScope, setErrorSummaryScope] = useState<ErrorSummaryScope>(undefined);
  const [errorSummaryFocusRequest, setErrorSummaryFocusRequest] = useState(0);
  const [externalAttachmentErrors, setExternalAttachmentErrors] = useState<Record<string, ExternalAttachmentError>>({});
  // Pages whose registrations or values changed during the current commit. They are refreshed from
  // an effect that runs after the field effects, so a page is never evaluated half-registered.
  const dirtyPagesRef = useRef(new Set<string>());
  const [dirtyVersion, setDirtyVersion] = useState(0);
  // With a resolver, a page is always rebuilt from the current state, so reading a stored violation
  // could show an error that a change on another page has already resolved.
  const derivesFieldsFromState = resolvePageFields !== undefined;

  const touchRegisteredFields = useCallback((pageKey: string) => {
    registeredFieldsRevisionRef.current.set(pageKey, (registeredFieldsRevisionRef.current.get(pageKey) ?? 0) + 1);
  }, []);

  const computePageValidation = useCallback(
    (pageKey: string): CachedPageValidation => {
      const resolvedFields = resolvePageFields?.(pageKey);
      const registeredFields = fieldsByPageRef.current.get(pageKey);
      const fields = resolvedFields ?? [...(registeredFields?.values() ?? [])];
      const fieldSource = resolvedFields ?? registeredFields;
      const registeredFieldsRevision = resolvedFields ? 0 : (registeredFieldsRevisionRef.current.get(pageKey) ?? 0);
      const cached = pageValidationCacheRef.current.get(pageKey);
      if (
        cached &&
        cached.fieldSource === fieldSource &&
        cached.registeredFieldsRevision === registeredFieldsRevision &&
        cached.externalAttachmentErrors === externalAttachmentErrors &&
        cached.currentLanguage === currentLanguage &&
        cached.allowTestTypes === allowTestTypes &&
        cached.translate === translate
      ) {
        return cached;
      }

      const fieldViolations = fields.flatMap(({ statePath, value, field, rules }) => {
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
      const violations = [...fieldViolations, ...attachmentViolations];
      const result = {
        fieldSource,
        registeredFieldsRevision,
        externalAttachmentErrors,
        currentLanguage,
        allowTestTypes,
        translate,
        violations,
        errors: violations.map((violation) => toFieldError(translate, violation)),
      };
      pageValidationCacheRef.current.set(pageKey, result);
      return result;
    },
    [allowTestTypes, currentLanguage, externalAttachmentErrors, resolvePageFields, translate],
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
      const { violations } = computePageValidation(pageKey);
      setPageState(pageKey, violations);
      setErrorSummaryScope((previous) =>
        previous?.type === 'page' && previous.pageKey === pageKey && violations.length === 0 ? undefined : previous,
      );
    },
    [computePageValidation, setPageState],
  );

  // Only pages that already show errors need refreshing: a page without error state has nothing
  // rendered to keep in sync and is evaluated from scratch when it is validated.
  const queuePageValidation = useCallback((pageKey: string) => {
    if (dirtyPagesRef.current.has(pageKey)) {
      return;
    }
    dirtyPagesRef.current.add(pageKey);
    setDirtyVersion((previous) => previous + 1);
  }, []);

  const schedulePageValidation = useCallback(
    (pageKey: string) => {
      if (pagesWithErrorsRef.current.has(pageKey)) {
        queuePageValidation(pageKey);
      }
    },
    [queuePageValidation],
  );

  const registerField = useCallback(
    (pageKey: string, field: ValidationField) => {
      const pageFields = fieldsByPageRef.current.get(pageKey) ?? new Map<string, ValidationField>();
      pageFields.set(field.statePath, field);
      fieldsByPageRef.current.set(pageKey, pageFields);
      touchRegisteredFields(pageKey);
      schedulePageValidation(pageKey);
    },
    [schedulePageValidation, touchRegisteredFields],
  );

  const unregisterField = useCallback(
    (pageKey: string, statePath: string) => {
      if (fieldsByPageRef.current.get(pageKey)?.delete(statePath)) {
        touchRegisteredFields(pageKey);
        schedulePageValidation(pageKey);
      }
    },
    [schedulePageValidation, touchRegisteredFields],
  );

  const updateFieldValue = useCallback(
    (pageKey: string, statePath: string, value: unknown) => {
      const field = fieldsByPageRef.current.get(pageKey)?.get(statePath);
      if (field && !Object.is(field.value, value)) {
        field.value = value;
        touchRegisteredFields(pageKey);
        schedulePageValidation(pageKey);
      }
    },
    [schedulePageValidation, touchRegisteredFields],
  );

  const resetPageFields = useCallback(
    (pageKey: string) => {
      fieldsByPageRef.current.set(pageKey, new Map());
      touchRegisteredFields(pageKey);
    },
    [touchRegisteredFields],
  );

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
      const { violations } = computePageValidation(pageKey);
      setPageState(pageKey, violations);
      setErrorSummaryScope(violations.length > 0 ? { type: 'page', pageKey } : undefined);
      if (violations.length > 0) {
        setErrorSummaryFocusRequest((previous) => previous + 1);
      }
      return violations.length === 0;
    },
    [computePageValidation, setPageState],
  );

  const validatePages = useCallback(
    (pageKeys: string[]) => {
      const failedPages = new Set<string>();
      const violationsByPageKey = new Map<string, FieldViolation[]>();
      pageKeys.forEach((pageKey) => {
        const { violations } = computePageValidation(pageKey);
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
      setErrorSummaryScope(failedPages.size > 0 ? { type: 'all-pages' } : undefined);
      if (failedPages.size > 0) {
        setErrorSummaryFocusRequest((previous) => previous + 1);
      }
      return [...failedPages];
    },
    [computePageValidation],
  );

  // Messages are worded here rather than when they are stored, so they always follow the language
  // the user is reading the form in.
  const getStoredErrors = useCallback(
    (pageKey: string): FieldError[] => {
      const violations = violationsByPage[pageKey];
      const cached = storedErrorsCacheRef.current.get(pageKey);
      if (cached?.violations === violations && cached.translate === translate) {
        return cached.errors;
      }
      const errors = (violations ?? []).map((violation) => toFieldError(translate, violation));
      storedErrorsCacheRef.current.set(pageKey, { violations, translate, errors });
      return errors;
    },
    [translate, violationsByPage],
  );

  const errorsFor = useCallback(
    (pageKey: string) =>
      derivesFieldsFromState
        ? computePageValidation(pageKey).errors
        : violationsByPage[pageKey]
          ? getStoredErrors(pageKey)
          : computePageValidation(pageKey).errors,
    [computePageValidation, derivesFieldsFromState, getStoredErrors, violationsByPage],
  );
  const getErrorsForPage = useCallback((pageKey: string) => errorsFor(pageKey), [errorsFor]);
  const getErrorsForPages = useCallback(
    (pageKeys: string[]) => {
      const pageErrors = pageKeys.map((pageKey) => errorsFor(pageKey));
      const cacheKey = JSON.stringify(pageKeys);
      const cached = combinedErrorsCacheRef.current.get(cacheKey);
      if (
        cached?.pageErrors.length === pageErrors.length &&
        pageErrors.every((errors, index) => cached.pageErrors[index] === errors)
      ) {
        return cached.errors;
      }
      const errors = pageErrors.flat();
      combinedErrorsCacheRef.current.set(cacheKey, { pageErrors, errors });
      return errors;
    },
    [errorsFor],
  );
  const getError = useCallback(
    (submissionPath: string, pageKey: string) =>
      pagesWithErrors.has(pageKey)
        ? errorsFor(pageKey).find((error) => error.submissionPath === submissionPath)?.message
        : undefined,
    [errorsFor, pagesWithErrors],
  );
  const hasErrorState = useCallback((pageKey: string) => pagesWithErrors.has(pageKey), [pagesWithErrors]);
  const hideErrorSummary = useCallback(() => setErrorSummaryScope(undefined), []);
  const isErrorSummaryVisibleForPage = useCallback(
    (pageKey: string) => errorSummaryScope?.type === 'page' && errorSummaryScope.pageKey === pageKey,
    [errorSummaryScope],
  );
  const isErrorSummaryVisibleForAllPages = useCallback(
    () => errorSummaryScope?.type === 'all-pages',
    [errorSummaryScope],
  );

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
        schedulePageValidation(inferredPageKey);
      }
      if (message && inferredPageKey) {
        setPagesWithErrors((previous) => {
          const next = togglePageInSet(previous, inferredPageKey, true);
          pagesWithErrorsRef.current = next;
          return next;
        });
        queuePageValidation(inferredPageKey);
        setErrorSummaryScope({ type: 'page', pageKey: inferredPageKey });
      }
    },
    [externalAttachmentErrors, queuePageValidation, schedulePageValidation],
  );
  const getAttachmentExternalError = useCallback(
    (attachmentId: string, field: AttachmentField) =>
      externalAttachmentErrors[attachmentValidationPath(attachmentId, field)]?.message,
    [externalAttachmentErrors],
  );

  const value = useMemo<ValidationContextValue>(
    () => ({
      pagesWithErrors,
      errorSummaryFocusRequest,
      registerField,
      unregisterField,
      updateFieldValue,
      resetPageFields,
      validatePage,
      validatePages,
      getError,
      getErrorsForPage,
      getErrorsForPages,
      hasErrorState,
      hideErrorSummary,
      isErrorSummaryVisibleForPage,
      isErrorSummaryVisibleForAllPages,
      schedulePageValidation,
      setAttachmentExternalError,
      getAttachmentExternalError,
    }),
    [
      getAttachmentExternalError,
      getError,
      getErrorsForPage,
      getErrorsForPages,
      hasErrorState,
      hideErrorSummary,
      isErrorSummaryVisibleForAllPages,
      isErrorSummaryVisibleForPage,
      pagesWithErrors,
      registerField,
      resetPageFields,
      schedulePageValidation,
      setAttachmentExternalError,
      errorSummaryFocusRequest,
      unregisterField,
      updateFieldValue,
      validatePage,
      validatePages,
    ],
  );

  const valueRef = useRef(value);
  const publishedValueRef = useRef(value);
  const listenersRef = useRef(new Set<() => void>());
  const versionRef = useRef(0);
  const store = useMemo<ValidationStore>(
    () => ({
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getVersion: () => versionRef.current,
      getValue: () => valueRef.current,
    }),
    [],
  );

  useLayoutEffect(() => {
    valueRef.current = value;
    if (publishedValueRef.current === value) {
      return;
    }
    publishedValueRef.current = value;
    versionRef.current += 1;
    listenersRef.current.forEach((listener) => listener());
  }, [value]);

  return <ValidationContext.Provider value={store}>{children}</ValidationContext.Provider>;
};

export type {
  PageFieldsResolver,
  ValidationActions,
  ValidationContextType,
  ValidationContextValue,
} from './validationContextTypes';
export {
  useErrorSummaryFocusRequest,
  useIsErrorSummaryVisibleForAllPages,
  useIsErrorSummaryVisibleForPage,
  useOptionalValidationActions,
  useValidationActions,
  useValidationAttachmentExternalError,
  useValidationErrorAccess,
  useValidationErrorsForPage,
  useValidationErrorsForPages,
  useValidationFieldError,
  useValidationPagesWithErrors,
} from './validationHooks';
export type { AttachmentField, FieldError, ValidationField } from './validationTypes';
export { attachmentValidationPath, ValidationProvider };

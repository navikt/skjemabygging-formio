import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { attachmentValidationPath } from './attachmentValidationPath';
import { ValidationActions, ValidationContextValue } from './validationContextTypes';
import { useOptionalValidationStore, useValidationStore, ValidationStore } from './validationStore';
import { AttachmentField, FieldError } from './validationTypes';

const noValidationActions: ValidationActions = {
  registerField: () => undefined,
  unregisterField: () => undefined,
  updateFieldValue: () => undefined,
  resetPageFields: () => undefined,
  validatePage: () => true,
  validatePages: () => [],
  hideErrorSummary: () => undefined,
  schedulePageValidation: () => undefined,
  setAttachmentExternalError: () => undefined,
};
const noValidationSubscription = () => () => undefined;
const noErrors: FieldError[] = [];

const createValidationActions = (store: ValidationStore): ValidationActions => ({
  registerField: (...args) => store.getValue().registerField(...args),
  unregisterField: (...args) => store.getValue().unregisterField(...args),
  updateFieldValue: (...args) => store.getValue().updateFieldValue(...args),
  resetPageFields: (...args) => store.getValue().resetPageFields(...args),
  validatePage: (...args) => store.getValue().validatePage(...args),
  validatePages: (...args) => store.getValue().validatePages(...args),
  hideErrorSummary: (...args) => store.getValue().hideErrorSummary(...args),
  schedulePageValidation: (...args) => store.getValue().schedulePageValidation(...args),
  setAttachmentExternalError: (...args) => store.getValue().setAttachmentExternalError(...args),
});

const useValidationErrorAccess = () => {
  const store = useValidationStore();
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  return {
    getError: (...args: Parameters<ValidationContextValue['getError']>) => store.getValue().getError(...args),
    getAttachmentExternalError: (...args: Parameters<ValidationContextValue['getAttachmentExternalError']>) =>
      store.getValue().getAttachmentExternalError(...args),
  };
};

const useValidationActions = (): ValidationActions => {
  const store = useValidationStore();
  return useMemo(() => createValidationActions(store), [store]);
};

const useOptionalValidationActions = (): ValidationActions => {
  const store = useOptionalValidationStore();
  return useMemo(() => (store ? createValidationActions(store) : noValidationActions), [store]);
};

const useValidationFieldError = (submissionPath: string, pageKey?: string): string | undefined => {
  const store = useOptionalValidationStore();
  const getSnapshot = useCallback(
    () => (store && pageKey !== undefined ? store.getValue().getError(submissionPath, pageKey) : undefined),
    [pageKey, store, submissionPath],
  );

  return useSyncExternalStore(store?.subscribe ?? noValidationSubscription, getSnapshot, getSnapshot);
};

const useValidationPagesWithErrors = (): Set<string> => {
  const store = useValidationStore();
  const getSnapshot = useCallback(() => store.getValue().pagesWithErrors, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useValidationErrorsForPage = (pageKey?: string): FieldError[] => {
  const store = useValidationStore();
  const getSnapshot = useCallback(
    () => (pageKey === undefined ? noErrors : store.getValue().getErrorsForPage(pageKey)),
    [pageKey, store],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useValidationErrorsForPages = (pageKeys: string[]): FieldError[] => {
  const store = useValidationStore();
  const getSnapshot = useCallback(() => store.getValue().getErrorsForPages(pageKeys), [pageKeys, store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useIsErrorSummaryVisibleForPage = (pageKey?: string): boolean => {
  const store = useValidationStore();
  const getSnapshot = useCallback(
    () => pageKey !== undefined && store.getValue().isErrorSummaryVisibleForPage(pageKey),
    [pageKey, store],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useIsErrorSummaryVisibleForAllPages = (): boolean => {
  const store = useValidationStore();
  const getSnapshot = useCallback(() => store.getValue().isErrorSummaryVisibleForAllPages(), [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useErrorSummaryFocusRequest = (): number => {
  const store = useValidationStore();
  const getSnapshot = useCallback(() => store.getValue().errorSummaryFocusRequest, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useValidationAttachmentExternalError = (attachmentId: string, field: AttachmentField): string | undefined => {
  const store = useValidationStore();
  const getSnapshot = useCallback(
    () => store.getValue().getAttachmentExternalError(attachmentId, field),
    [attachmentId, field, store],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export {
  attachmentValidationPath,
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
};

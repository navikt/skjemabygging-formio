import { FieldError, ValidationField } from './validationTypes';

type ErrorSummaryScope = { type: 'page'; pageKey: string } | { type: 'all-pages' } | undefined;
type PageFieldsResolver = (pageKey: string) => ValidationField[] | undefined;

interface ValidationContextValue {
  pagesWithErrors: Set<string>;
  errorSummaryFocusRequest: number;
  registerField: (pageKey: string, field: ValidationField) => void;
  unregisterField: (pageKey: string, statePath: string) => void;
  updateFieldValue: (pageKey: string, statePath: string, value: unknown) => void;
  resetPageFields: (pageKey: string) => void;
  validatePage: (pageKey: string) => boolean;
  validatePages: (pageKeys: string[]) => string[];
  getError: (submissionPath: string, pageKey: string) => string | undefined;
  getErrorsForPage: (pageKey: string) => FieldError[];
  getErrorsForPages: (pageKeys: string[]) => FieldError[];
  hasErrorState: (pageKey: string) => boolean;
  hideErrorSummary: () => void;
  isErrorSummaryVisibleForPage: (pageKey: string) => boolean;
  isErrorSummaryVisibleForAllPages: () => boolean;
  schedulePageValidation: (pageKey: string) => void;
  setExternalError: (submissionPath: string, message?: string, pageKey?: string) => void;
  getExternalError: (submissionPath: string) => string | undefined;
}

type ValidationActions = Pick<
  ValidationContextValue,
  | 'registerField'
  | 'unregisterField'
  | 'updateFieldValue'
  | 'resetPageFields'
  | 'validatePage'
  | 'validatePages'
  | 'hideErrorSummary'
  | 'schedulePageValidation'
  | 'setExternalError'
>;

export type {
  ErrorSummaryScope,
  PageFieldsResolver,
  ValidationActions,
  ValidationContextValue as ValidationContextType,
  ValidationContextValue,
};

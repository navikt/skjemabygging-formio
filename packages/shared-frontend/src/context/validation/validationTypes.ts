import { RuleViolation, ValidationRules } from '../../validation/validators';

/** A validated field, as registered by the component that renders it. */
interface ValidationField {
  statePath: string;
  value: unknown;
  field: string;
  rules: ValidationRules;
}

/**
 * An error before it is put into words. Keeping the message key and its parameters until the error
 * is read means the messages always follow the current language.
 */
interface FieldViolation {
  pageKey: string;
  submissionPath: string;
  field: string;
  violation?: RuleViolation;
  /** Already worded message, for errors that come from outside validation (upload failures). */
  message?: string;
}

interface FieldError {
  pageKey: string;
  submissionPath: string;
  field: string;
  message: string;
}

type ExternalFieldError = { submissionPath: string; message: string; pageKey?: string };

export type { ExternalFieldError, FieldError, FieldViolation, ValidationField };

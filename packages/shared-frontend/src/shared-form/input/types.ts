import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { type RefObject } from 'react';

type SharedFormTranslate = (text: string, variables?: Record<string, string | number>) => string;

type SharedFormInputRef = RefObject<HTMLInputElement | HTMLSelectElement | HTMLFieldSetElement | HTMLElement | null>;

interface SharedFormInputValidators {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  nationalIdentityNumber?: boolean;
  coverPage?: boolean;
}

interface SharedFormInputError {
  submissionPath: string;
  ref?: SharedFormInputRef;
  message: string;
}

interface SharedFormInputValidationRuntime {
  addValidation: (
    submissionPath: string,
    ref: SharedFormInputRef,
    validators: SharedFormInputValidators,
    field: string,
  ) => void;
  removeValidation: (submissionPath: string) => void;
  getRefError: (ref: SharedFormInputRef) => string;
  errors: SharedFormInputError[];
}

interface SharedFormInputRuntime {
  submission?: Submission;
  updateSubmission: (submissionPath: string, value: unknown) => void;
  translate: SharedFormTranslate;
  validation: SharedFormInputValidationRuntime;
  logger?: {
    debug?: (...args: unknown[]) => void;
  };
}

export type {
  SharedFormInputError,
  SharedFormInputRef,
  SharedFormInputRuntime,
  SharedFormInputValidationRuntime,
  SharedFormInputValidators,
  SharedFormTranslate,
};

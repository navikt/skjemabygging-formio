import type { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';

type SharedFormInputValue = string | number | boolean | string[] | null | undefined;

interface SharedFormInputValidators {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  nationalIdentityNumber?: boolean;
  coverPage?: boolean;
}

interface SharedFormInputProps {
  component: Component;
  submissionPath: string;
  submission?: Submission;
  value?: SharedFormInputValue;
  translate: TranslateFunction;
  onChange: (value: SharedFormInputValue) => void;
  readOnly?: boolean;
}

interface SharedFormInputNode {
  type: string;
  key?: string;
  component: Component;
  submissionPath: string;
  label?: string;
  description?: string;
  value?: SharedFormInputValue;
  children?: SharedFormInputNode[];
}

interface SharedFormTextFieldInputNode extends SharedFormInputNode {
  type: 'text-field';
  validators?: Pick<
    SharedFormInputValidators,
    'required' | 'minLength' | 'maxLength' | 'nationalIdentityNumber' | 'coverPage'
  >;
  autoComplete?: string;
  readOnly?: boolean;
}

export type {
  SharedFormInputNode,
  SharedFormInputProps,
  SharedFormInputValidators,
  SharedFormInputValue,
  SharedFormTextFieldInputNode,
};

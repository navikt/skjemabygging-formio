import type { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';

type SharedFormInputValue = string | number | boolean | string[] | null | undefined;

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

export type { SharedFormInputNode, SharedFormInputProps, SharedFormInputValue };

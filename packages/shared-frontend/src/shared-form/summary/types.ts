import type {
  Component,
  FormPropertiesType,
  PanelValidation,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import type { ComponentType } from 'react';

interface SummaryRuntimeConfig {
  submissionMethod?: SubmissionMethod;
  logger?: {
    error?: (message: string) => void;
  };
  config?: Record<string, string | boolean | object | undefined>;
}

interface FormComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: FormComponentRegistry;
  panelValidationList?: PanelValidation[];
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  formProperties: FormPropertiesType;
  appConfig: SummaryRuntimeConfig;
}

interface FormComponentRegistry {
  [key: string]: ComponentType<FormComponentProps>;
}

export type { FormComponentProps, FormComponentRegistry, SummaryRuntimeConfig };

import {
  Component,
  PdfData,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

interface SharedFormPdfRuntimeConfig {
  gitVersion?: string;
  isDelingslenke?: boolean;
  [key: string]: string | boolean | object | undefined;
}

interface PdfComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: PdfComponentRegistry;
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  submissionMethod?: SubmissionMethod;
}

interface PdfComponentRegistry {
  [key: string]: (props: PdfComponentProps) => PdfData[] | PdfData | null;
}

interface SharedFormPdfRuntime {
  config?: SharedFormPdfRuntimeConfig;
}

export type { PdfComponentProps, PdfComponentRegistry, SharedFormPdfRuntime };

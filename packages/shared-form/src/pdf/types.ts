import {
  Component,
  PdfData,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

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
  gitVersion?: string;
  isDelingslenke?: boolean;
  logger?: {
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
}

export type { PdfComponentProps, PdfComponentRegistry, SharedFormPdfRuntime };

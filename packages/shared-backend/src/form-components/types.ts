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

interface PdfRendererAppConfig {
  config?: {
    gitVersion?: string;
    isDelingslenke?: boolean;
  };
}

export type { PdfComponentProps, PdfComponentRegistry, PdfRendererAppConfig };

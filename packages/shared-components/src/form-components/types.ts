import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PdfData {
  label: string;
  verdi?: string | null;
  verdiliste?: PdfData[] | null;
  pdfConfig?: PdfConfig | null;
  skjemanummer?: string | null;
  bunntekst?: PdfFooter | null;
  vannmerke?: string | null;
}

interface PdfConfig {
  harInnholdsfortegnelse: boolean;
  språk: string;
}

interface PdfFooter {
  upperleft: string | null;
  lowerleft: string | null;
  upperMiddle: string | null;
  lowerMiddle: string | null;
  upperRight: string | null;
}

interface FormComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: FormComponentRegistry;
}

interface FormComponentRegistry {
  [key: string]: React.ComponentType<FormComponentProps>;
}

interface PdfComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: PdfComponentRegistry;
}

interface PdfComponentRegistry {
  [key: string]: (props: PdfComponentProps) => PdfData;
}

export type { FormComponentProps, FormComponentRegistry, PdfComponentProps, PdfComponentRegistry };

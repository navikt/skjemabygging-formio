import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../context/form/FormContext';
import { LanguageContextType } from '../context/languages/languages-context';
import { PanelValidation } from '../util/form/panel-validation/panelValidation';

type PdfListElement = PdfData | PdfData[] | null;

interface PdfFormData {
  label?: string;
  verdiliste?: PdfListElement[];
  pdfConfig?: PdfConfig | null;
  skjemanummer?: string | null;
  bunntekst?: PdfFooter | null;
  vannmerke?: string | null;
}

interface PdfData {
  label?: string;
  verdi?: string | number | null;
  verdiliste?: PdfListElement[];
  visningsVariant?: string | null;
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
  panelValidationList?: PanelValidation[];
}

interface FormComponentRegistry {
  [key: string]: React.ComponentType<FormComponentProps>;
}

interface PdfComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: PdfComponentRegistry;
  formContext: FormContextType;
  languagesContext: LanguageContextType;
}

interface PdfComponentRegistry {
  [key: string]: (props: PdfComponentProps) => PdfListElement;
}

export type {
  FormComponentProps,
  FormComponentRegistry,
  PdfComponentProps,
  PdfComponentRegistry,
  PdfConfig,
  PdfData,
  PdfFooter,
  PdfFormData,
  PdfListElement,
};

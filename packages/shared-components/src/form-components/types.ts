import {
  Component,
  FormPropertiesType,
  PanelValidation,
  PdfData,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../context/config/configContext';

interface FormComponentProps {
  component: Component;
  submissionPath: string;
  componentRegistry: FormComponentRegistry;
  panelValidationList?: PanelValidation[];
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  formProperties: FormPropertiesType;
  appConfig: AppConfigContextType;
}

interface FormComponentRegistry {
  [key: string]: React.ComponentType<FormComponentProps>;
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

export type { FormComponentProps, FormComponentRegistry, PdfComponentProps, PdfComponentRegistry };

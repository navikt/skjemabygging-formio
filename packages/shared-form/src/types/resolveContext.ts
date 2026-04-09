import {
  Component,
  FormPropertiesType,
  PanelValidation,
  Submission,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

interface ResolveContext {
  submissionPath: string;
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  formProperties?: FormPropertiesType;
  panelValidationList?: PanelValidation[];
}

interface ResolveComponentProps extends ResolveContext {
  component: Component;
}

interface ResolveFormProps extends ResolveContext {
  components: Component[];
}

export type { ResolveComponentProps, ResolveContext, ResolveFormProps };

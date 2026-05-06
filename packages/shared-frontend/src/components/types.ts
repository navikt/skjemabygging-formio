import {
  Component,
  FormPropertiesType,
  PanelValidation,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

type HandleAttachmentDownloadFile = (attachmentId: string, fileId: string, fileName: string) => Promise<void>;

interface SummaryRendererAppConfig {
  submissionMethod?: SubmissionMethod;
  logger?: {
    error?: (...args: unknown[]) => void;
  };
  config?: {
    NAIS_CLUSTER_NAME?: string;
  };
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
  appConfig: SummaryRendererAppConfig;
  handleDownloadFile?: HandleAttachmentDownloadFile;
}

interface FormComponentRegistry {
  [key: string]: React.ComponentType<FormComponentProps>;
}

export type { FormComponentProps, FormComponentRegistry, HandleAttachmentDownloadFile, SummaryRendererAppConfig };

import {
  Component,
  FormPropertiesType,
  PanelValidation,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ApplicationEnvironment, ApplicationLogger } from '../context/application/ApplicationContext';

type HandleAttachmentDownloadFile = (attachmentId: string, fileId: string, fileName: string) => Promise<void>;

interface SummaryRendererConfig {
  submissionMethod?: SubmissionMethod;
  logger?: ApplicationLogger;
  environment: ApplicationEnvironment;
}

interface SummaryRendererAppConfig {
  submissionMethod?: SubmissionMethod;
  logger?: ApplicationLogger;
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
  rendererConfig: SummaryRendererConfig;
  handleDownloadFile?: HandleAttachmentDownloadFile;
  legacyAttachmentPanelMode?: boolean;
}

interface FormComponentRegistry {
  [key: string]: React.ComponentType<FormComponentProps>;
}

export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
};

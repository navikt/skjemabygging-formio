import {
  Component,
  FormPropertiesType,
  PanelValidation,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

type HandleAttachmentDownloadFile = (attachmentId: string, fileId: string, fileName: string) => Promise<void>;

/**
 * Structural subset of the app config consumed by summary renderers. Callers that
 * already hold the full AppConfigContextType from `shared-components` pass it as-is;
 * declaring the shape here keeps `shared-frontend` independent of `shared-components`.
 */
interface SummaryRendererAppConfig {
  submissionMethod?: SubmissionMethod;
  logger?: {
    error?: (message: string, metadata?: object) => void;
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

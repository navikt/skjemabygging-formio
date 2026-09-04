import {
  Component,
  FormComponentType,
  FormPropertiesType,
  PanelValidation,
  Submission,
  SubmissionMethod,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ApplicationEnvironment, ApplicationLogger } from '../context/application/ApplicationContext';
import { ComponentDefinitionByType } from './component-types';

type HandleAttachmentDownloadFile = (attachmentId: string, fileId: string, fileName: string) => Promise<void>;

/**
 * Component `type` literals handled by the summary registry: every
 * `FormComponentType`. Unlike the input registry, this INCLUDES `panel`
 * (SummaryPanel).
 */
type SummaryComponentType = FormComponentType;

interface SummaryRendererConfig {
  submissionMethod?: SubmissionMethod;
  logger?: ApplicationLogger;
  environment: ApplicationEnvironment;
}

interface ResolvedSummaryRendererConfig extends SummaryRendererConfig {
  formPath: string;
}

interface SummaryRendererAppConfig {
  submissionMethod?: SubmissionMethod;
  logger?: ApplicationLogger;
  config?: {
    NAIS_CLUSTER_NAME?: string;
  };
}

/**
 * Props for a summary adapter. Parameterized by the adapter's component
 * definition: a migrated adapter declares e.g. `FormComponentProps<TextFieldDefinition>`
 * and receives the exact type.
 */
interface FormComponentProps<T extends Component = Component> {
  component: T;
  submissionPath: string;
  componentRegistry: FormComponentRegistry;
  panelValidationList?: PanelValidation[];
  submission: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  formProperties: FormPropertiesType;
  rendererConfig: ResolvedSummaryRendererConfig;
  handleDownloadFile?: HandleAttachmentDownloadFile;
  legacyAttachmentPanelMode?: boolean;
}

/**
 * Registry mapping each supported component `type` to its summary adapter. The
 * mapped type ties every key to an adapter expecting that type's definition
 * (`ComponentDefinitionByType<K>`), enforcing correct-key and exhaustiveness the
 * same way the input registry does.
 */
type FormComponentRegistry = {
  [K in SummaryComponentType]: React.ComponentType<FormComponentProps<ComponentDefinitionByType<K>>>;
};

export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  ResolvedSummaryRendererConfig,
  SummaryComponentType,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
};

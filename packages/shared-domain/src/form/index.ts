import { Enhetstype } from '../enhet';

export type DisplayType = 'wizard' | 'form';
export type InnsendingType = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

export enum DeclarationType {
  none = 'none',
  default = 'default',
  custom = 'custom',
}

export interface FormSignaturesType {
  [key: string]: any;

  signature1?: string;
  signature1Description?: string;
  signature2?: string;
  signature2Description?: string;
  signature3?: string;
  signature3Description?: string;
  signature4?: string;
  signature4Description?: string;
  signature5?: string;
  signature5Description?: string;
}

export interface NewFormSignatureType {
  [key: string]: string;

  label: string;
  description: string;
  key: string;
}

export const PrefillType = {
  sokerFornavn: 'Søkers fornavn',
  sokerEtternavn: 'Søkers etternavn',
} as const;

export type PrefillKey = keyof typeof PrefillType;

export interface FormPropertiesType {
  skjemanummer: string;
  tema: string;
  modified?: string;
  modifiedBy?: string;
  published?: string;
  publishedBy?: string;
  publishedLanguages?: string[];
  unpublished?: string;
  unpublishedBy?: string;
  downloadPdfButtonText?: string;
  innsending?: InnsendingType;
  ettersending?: InnsendingType;
  ettersendelsesfrist?: string;
  innsendingForklaring?: string;
  innsendingOverskrift?: string;
  isTestForm?: boolean;
  declarationType?: DeclarationType;
  declarationText?: string;
  mottaksadresseId?: string;
  enhetMaVelgesVedPapirInnsending?: boolean;
  enhetstyper?: Enhetstype[];
  /**
   * @deprecated hasLabeledSignatures blir ikke brukt etter migrering
   */
  hasLabeledSignatures?: boolean;
  signatures?: NewFormSignatureType[] | FormSignaturesType;
  descriptionOfSignatures?: string;
  descriptionOfSignaturesPositionUnder?: boolean;
  prefill?: PrefillKey[];
}

export type FormPropertiesPublishing = Pick<
  FormPropertiesType,
  'modified' | 'modifiedBy' | 'published' | 'publishedBy' | 'publishedLanguages' | 'unpublished' | 'unpublishedBy'
>;

type ComponentDataSrc = 'values' | 'url' | 'json' | 'custom' | 'resource';

interface ComponentValue {
  value: string;
  label: string;
}

export interface Component {
  id?: string;
  navId?: string;
  key: string;
  label: string;
  type: string;
  content?: string;
  calculateValue?: string;
  data?: any;
  dataSrc?: ComponentDataSrc;
  validate?: ComponentValidate;
  conditional?: ComponentConditional;
  customConditional?: string;
  valueProperty?: string;
  labelProperty?: string;
  properties?: ComponentProperties;
  components?: Component[];
  otherDocumentation?: boolean;
  isAttachmentPanel?: boolean;
  prefill?: PrefillKey;
  values?: ComponentValue[];
  hideLabel?: boolean;
  description?: string;
  suffix?: string;
  prefix?: string;
  title?: string;
  html?: string;
  legend?: string;
  additionalDescriptionLabel?: string;
  additionalDescriptionText?: string;
  contentForPdf?: string;
  altText?: string;
  buttonText?: string;
  addAnother?: string;
  removeAnother?: string;
  input?: boolean;
}

export interface ComponentProperties {
  vedleggstittel?: string;
  vedleggskode?: string;
  vedleggErValgfritt?: 'ja' | 'nei';
}

export interface Attachment {
  vedleggstittel?: string;
  vedleggskode?: string;
  label?: string;
}

export interface Panel extends Component {
  title: string;
}

export interface ComponentValidate {
  custom?: string;
  json?: string;
}

export interface ComponentConditional {
  when?: string;
  json?: string;
}

export interface ResourceAccess {
  type: string;
  roles: string[];
}

export interface NavFormType {
  _id?: string;
  tags: string[];
  type: string;
  display: DisplayType;
  name: string;
  title: string;
  path: string;
  modified?: string;
  properties: FormPropertiesType;
  components: Component[];
  access?: ResourceAccess[];
}

export type SubmissionData = Record<string, string | number | boolean | any[] | object>;

type ErrorType =
  | 'GET FAILED'
  | 'CREATE FAILED'
  | 'UPDATE FAILED'
  | 'DELETE FAILED'
  | 'SUBMIT FAILED'
  | 'SUBMIT AND UPDATE FAILED';
export type MellomlagringError = {
  title?: string;
  message: string;
  type: ErrorType;
  messageParams?: Record<string, any>;
};

export interface FyllutState {
  mellomlagring?: {
    isActive?: boolean;
    savedDate?: string;
    error?: MellomlagringError;
  };
}

export interface Submission {
  data: SubmissionData;
  metadata: {
    selectedData: any;
    timezone: string;
    offset: number;
    origin: string;
    referrer: string;
    browserName: string;
    userAgent: string;
    pathName: string;
    onLine: boolean;
  };
  state: string;
  fyllutState?: FyllutState;
}

export type UsageContext = 'create' | 'edit';

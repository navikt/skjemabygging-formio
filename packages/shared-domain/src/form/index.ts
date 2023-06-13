import { Enhetstype } from "../enhet";

export type DisplayType = "wizard" | "form";
export type InnsendingType = "PAPIR_OG_DIGITAL" | "KUN_PAPIR" | "KUN_DIGITAL" | "INGEN";
export enum DeclarationType {
  none = "none",
  default = "default",
  custom = "custom",
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
}

export type FormPropertiesPublishing = Pick<
  FormPropertiesType,
  "modified" | "modifiedBy" | "published" | "publishedBy" | "publishedLanguages" | "unpublished" | "unpublishedBy"
>;

type ComponentDataSrc = "values" | "url" | "json" | "custom" | "resource";

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
  properties?: Record<string, string>;
  components?: Component[];
  otherDocumentation?: boolean;
  isAttachmentPanel?: boolean;
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
}

export type SubmissionData = Record<string, string | number | any[] | object>;

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
}

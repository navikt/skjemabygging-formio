import { Enhetstype } from "../enhet";

export type DisplayType = "wizard" | "form";
export type InnsendingType = "PAPIR_OG_DIGITAL" | "KUN_PAPIR" | "KUN_DIGITAL" | "INGEN";

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
  [key: string]: any;
  label: string;
  description: string;
  key: string;
}

export interface FormPropertiesType {
  skjemanummer: string;
  tema: string;
  modified?: string;
  published?: string;
  downloadPdfButtonText?: string;
  innsending?: InnsendingType;
  innsendingForklaring?: string;
  innsendingOverskrift?: string;
  /**
   * @deprecated hasPapirInnsendingOnly blir erstattet av innsending
   */
  hasPapirInnsendingOnly?: boolean;
  mottaksadresseId?: string;
  enhetMaVelgesVedPapirInnsending?: boolean;
  enhetstyper?: Enhetstype[];
  hasLabeledSignatures: boolean;
  signatures?: NewFormSignatureType[] | FormSignaturesType;
  descriptionOfSignatures?: string;
}

export interface Component {
  key: string;
  label: string;
  type: string;
  components?: Component[];
}

export interface NavFormType {
  _id?: string;
  tags: string[];
  type: string;
  display: DisplayType;
  name: string;
  title: string;
  path: string;
  properties: FormPropertiesType;
  components: Component[];
}

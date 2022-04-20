import { Enhetstype } from "@navikt/skjemadigitalisering-shared-domain/types/enhet";

export type DisplayType = "wizard" | "form";
export type InnsendingType = "PAPIR_OG_DIGITAL" | "KUN_PAPIR" | "KUN_DIGITAL" | "INGEN";

export interface FormSignaturesType {
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

export interface FormPropertiesType {
  skjemanummer: string;
  tema: string;
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
  enhetsTyper?: Enhetstype[];
  hasLabeledSignatures: boolean;
  signatures?: FormSignaturesType;
  descriptionOfSignatures?: string;
}

export interface NavFormType {
  tags: string[];
  type: string;
  display: DisplayType;
  name: string;
  title: string;
  path: string;
  properties: FormPropertiesType;
  components: any[];
}

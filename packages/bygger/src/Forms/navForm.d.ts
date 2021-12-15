export type DisplayType = 'wizard' | 'form';
export type InnsendingType = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

export interface FormSignaturesType {
  signature1?: string;
  signature2?: string;
  signature3?: string;
  signature4?: string;
  signature5?: string;
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
  hasLabeledSignatures: boolean;
  signatures?: FormSignaturesType;
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

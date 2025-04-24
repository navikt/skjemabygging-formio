export interface NewFormSignatureType {
  [key: string]: string;

  label: string;
  description: string;
  key: string;
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

export interface MottaksadresseData {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
  temakoder?: string;
}

export interface Mottaksadresse {
  _id: string;
  data: MottaksadresseData;
  owner?: string;
  roles?: unknown[];
  access?: unknown[];
  metadata?: unknown;
  form?: string;
  externalIds?: unknown[];
  created?: string;
  modified?: string;
}

export interface MottaksadresseData {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
  temakoder?: string;
}

export interface MottaksadresseEntity {
  _id: string;
  data: MottaksadresseData;
}

export interface Mottaksadresse {
  _id: string;
  owner: string;
  roles: unknown[];
  data: MottaksadresseData;
  access: unknown[];
  metadata: unknown;
  form: string;
  externalIds: unknown[];
  created: string;
  modified: string;
}

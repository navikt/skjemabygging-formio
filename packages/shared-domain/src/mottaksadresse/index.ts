export interface MottaksadresseData {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
}

export interface MottaksadresseEntity {
  _id: string;
  data: MottaksadresseData;
}

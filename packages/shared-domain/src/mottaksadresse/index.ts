import { FormioResource } from '../resource';

export interface MottaksadresseData {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
  temakoder?: string;
}

export interface Mottaksadresse extends FormioResource {
  data: MottaksadresseData;
}

import { ComponentValue } from '../form';

interface Address {
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;

  adresse?: string;
  postnummer?: string;
  bySted?: string; // poststed for norske adresser
  landkode: string;
  land: ComponentValue;
  co?: string;
  postboks?: string;

  // only for foreign addresses
  bygning?: string;
  region?: string;
}

export default Address;

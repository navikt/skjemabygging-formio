interface Address {
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;

  adresse?: string;
  postnummer?: string;
  bySted?: string; // poststed for norske adresser
  landkode: string;
  co?: string;
  postboks?: string;

  // only for foreign addresses
  bygning?: string;
  region?: string;
}

interface SubmissionAddress {
  sokerAdresser?: {
    bostedsadresse?: Address;
    oppholdsadresser?: Address[];
    kontaktadresser?: Address[];
  };
}

export default SubmissionAddress;

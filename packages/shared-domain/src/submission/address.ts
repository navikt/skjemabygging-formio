interface Address {
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;

  adresse?: string;
  postnummer?: string;
  landkode: string;
  co?: string;
  postboks?: string;

  // only for foreign addresses
  bygning?: string;
  bySted?: string;
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

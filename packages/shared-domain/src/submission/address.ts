import Address from '../address/address';

interface SubmissionAddress {
  sokerAdresser?: {
    bostedsadresse?: Address;
    oppholdsadresser?: Address[];
    kontaktadresser?: Address[];
  };
}

export default SubmissionAddress;

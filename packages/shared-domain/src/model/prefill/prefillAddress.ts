import Address from '../address/address';

interface PrefillAddress {
  sokerAdresser?: {
    bostedsadresse?: Address;
    oppholdsadresser?: Address[];
    kontaktadresser?: Address[];
  };
}

export default PrefillAddress;

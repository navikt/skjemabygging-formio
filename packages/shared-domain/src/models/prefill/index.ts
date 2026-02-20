import { Address } from '../address';

interface PrefillAddress {
  sokerAdresser?: {
    bostedsadresse?: Address;
    oppholdsadresser?: Address[];
    kontaktadresser?: Address[];
  };
}

type PrefillKey = 'sokerFornavn' | 'sokerEtternavn' | 'sokerTelefonnummer' | 'sokerKjonn';

type PrefillData = {
  sokerFornavn?: string;
  sokerEtternavn?: string;
  sokerTelefonnummer?: string;
  sokerKjonn?: string;
};

export type { PrefillAddress, PrefillData, PrefillKey };

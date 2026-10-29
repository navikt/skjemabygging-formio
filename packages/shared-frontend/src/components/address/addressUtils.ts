import {
  AddressType,
  PrefillKey,
  resolveAddressType,
  shouldShowAddressTypeChoice,
  SubmissionAddress,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getCountryObject } from '../../utils/countries';

type AddressPriority = 'bostedsadresse' | 'oppholdsadresse' | 'kontaktadresse';
type AddressTypeWizard = 'predefined' | 'user';

interface AddressConfig {
  addressPriority?: AddressPriority;
  addressType?: AddressType;
  addressTypeWizard?: AddressTypeWizard;
  prefillKey?: PrefillKey | PrefillKey[];
  prefillValue?: string | object;
}

type RawPrefilledAddress = Partial<SubmissionAddress>;

type RawPrefilledAddresses = {
  bostedsadresse?: RawPrefilledAddress;
  oppholdsadresser?: RawPrefilledAddress[];
  kontaktadresser?: RawPrefilledAddress[];
};

const toRawPrefilledAddresses = (prefillValue?: string | object): RawPrefilledAddresses | undefined => {
  if (!prefillValue || typeof prefillValue !== 'object') {
    return undefined;
  }

  if ('sokerAdresser' in prefillValue && prefillValue.sokerAdresser && typeof prefillValue.sokerAdresser === 'object') {
    return prefillValue.sokerAdresser as RawPrefilledAddresses;
  }

  return prefillValue as RawPrefilledAddresses;
};

const normalizePrefilledAddress = (
  address: RawPrefilledAddress | undefined,
  language: string,
): SubmissionAddress | undefined => {
  if (!address) {
    return undefined;
  }

  return {
    ...address,
    land: address.land ?? (address.landkode ? getCountryObject(address.landkode, language) : undefined),
  } as SubmissionAddress;
};

const getPrefilledAddress = (
  config: Pick<AddressConfig, 'addressPriority' | 'prefillValue'>,
  language: string,
): SubmissionAddress | undefined => {
  const addresses = toRawPrefilledAddresses(config.prefillValue);

  if (!addresses) {
    return undefined;
  }

  const orderedAddresses =
    config.addressPriority === 'oppholdsadresse'
      ? [addresses.oppholdsadresser?.[0], addresses.kontaktadresser?.[0], addresses.bostedsadresse]
      : config.addressPriority === 'kontaktadresse'
        ? [addresses.kontaktadresser?.[0], addresses.bostedsadresse, addresses.oppholdsadresser?.[0]]
        : [addresses.bostedsadresse, addresses.oppholdsadresser?.[0], addresses.kontaktadresser?.[0]];

  return normalizePrefilledAddress(
    orderedAddresses.find((address) => address !== undefined),
    language,
  );
};

export { getPrefilledAddress, resolveAddressType, shouldShowAddressTypeChoice };
export type { AddressConfig, AddressPriority, AddressTypeWizard };

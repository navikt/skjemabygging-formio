import {
  AddressType,
  PrefillKey,
  SubmissionAddress,
  SubmissionMethod,
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

const isPaperLikeSubmissionMethod = (submissionMethod?: SubmissionMethod) =>
  submissionMethod === undefined || submissionMethod === 'paper' || submissionMethod === 'digitalnologin';

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

const getCountryCode = (address?: SubmissionAddress) => {
  const countryCode = address?.landkode ?? address?.land?.value;
  return typeof countryCode === 'string' ? countryCode.toUpperCase() : undefined;
};

const resolveAddressType = (
  config: Pick<AddressConfig, 'addressType' | 'prefillKey'>,
  address?: SubmissionAddress,
  submissionMethod?: SubmissionMethod,
): AddressType | undefined => {
  if (config.addressType) {
    return config.addressType;
  }

  if (address?.borDuINorge === 'ja') {
    if (address.vegadresseEllerPostboksadresse === 'vegadresse') {
      return 'NORWEGIAN_ADDRESS';
    }

    if (address.vegadresseEllerPostboksadresse === 'postboksadresse') {
      return 'POST_OFFICE_BOX';
    }
  }

  if (address?.borDuINorge === 'nei') {
    return 'FOREIGN_ADDRESS';
  }

  const countryCode = getCountryCode(address);
  if (countryCode && countryCode !== 'NO' && countryCode !== 'NOR') {
    return 'FOREIGN_ADDRESS';
  }

  if (address?.postboks) {
    return 'POST_OFFICE_BOX';
  }

  if (config.prefillKey && submissionMethod === 'digital') {
    return 'NORWEGIAN_ADDRESS';
  }

  return undefined;
};

const shouldShowAddressTypeChoice = (
  config: Pick<AddressConfig, 'prefillKey' | 'addressTypeWizard'>,
  submissionMethod?: SubmissionMethod,
) =>
  (!!config.prefillKey && isPaperLikeSubmissionMethod(submissionMethod)) ||
  (!config.prefillKey && config.addressTypeWizard === 'user');

export { getPrefilledAddress, resolveAddressType, shouldShowAddressTypeChoice };
export type { AddressConfig, AddressPriority, AddressTypeWizard };

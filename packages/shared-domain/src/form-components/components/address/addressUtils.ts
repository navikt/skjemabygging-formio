import { AddressType, SubmissionAddress } from '../../../models';
import { Address } from '../../../models/address';

const addressToString = (address: Address): string => {
  const addressComponents = [
    address?.co ? `c/o ${address.co}` : undefined,
    address?.adresse,
    address?.bygning,
    address?.postboks,
    address?.postnummer
      ? address.bySted
        ? `${address?.postnummer} ${address?.bySted}`
        : address.postnummer
      : address?.bySted,
    address?.region,
    address?.land?.label,
  ].filter(Boolean);

  return addressComponents.join(', ');
};

const NORWEGIAN_COUNTRY_CODES = ['no', 'nor'];

const isNorwegianCountryCode = (code?: string) => !code || NORWEGIAN_COUNTRY_CODES.includes(code.toLowerCase());

/**
 * Single definition of which address variant a submitted address represents.
 *
 * A component with a predefined `addressType` wins. Otherwise the answer to the address type choice
 * decides. Legacy and prefilled values answer neither, so the present fields decide, and an address
 * holding both a street address and a post office box stays unresolved.
 */
const resolveAddressType = (address?: SubmissionAddress, addressType?: AddressType): AddressType | undefined => {
  if (addressType) {
    return addressType;
  }
  if (!address) {
    return undefined;
  }
  if (address.borDuINorge === 'nei') {
    return 'FOREIGN_ADDRESS';
  }
  if (address.vegadresseEllerPostboksadresse === 'vegadresse') {
    return 'NORWEGIAN_ADDRESS';
  }
  if (address.vegadresseEllerPostboksadresse === 'postboksadresse') {
    return 'POST_OFFICE_BOX';
  }
  if (!isNorwegianCountryCode(address.landkode ?? address.land?.value)) {
    return 'FOREIGN_ADDRESS';
  }
  if (address.postboks && !address.adresse) {
    return 'POST_OFFICE_BOX';
  }
  if (address.adresse && !address.postboks) {
    return 'NORWEGIAN_ADDRESS';
  }
  return undefined;
};

export { addressToString, resolveAddressType };

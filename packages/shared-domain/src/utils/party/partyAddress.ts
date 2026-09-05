import { PartyAddress, SubmissionAddress } from '../../models';

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const mapSubmissionAddress = (address: SubmissionAddress): PartyAddress => ({
  co: address.co,
  postOfficeBox: address.postboks,
  streetAddress: address.adresse,
  building: address.bygning,
  postalCode: address.postnummer,
  postalName: address.bySted,
  region: address.region,
  country: address.land,
});

/**
 * An address only identifies a person when it carries at least one populated value. Compatibility
 * mapping always produces an address object, so its presence alone says nothing.
 */
const hasAddressValue = (address: PartyAddress): boolean =>
  Object.values(address).some((value) =>
    isText(value) ? true : typeof value === 'object' && value !== null && Object.values(value).some(isText),
  );

export { hasAddressValue, isText, mapSubmissionAddress };

import {
  ConcernedUser,
  Draft,
  Form,
  NavFormType,
  Party,
  PartyAddress,
  PartyDraft,
  Sender,
  SubmissionAddress,
  SubmissionData,
  SubmissionSender,
  SubmissionYourInformation,
} from '../../models';
import { addressUtils } from '../address';
import { senderUtils, yourInformationUtils } from '../submission';
import { ParseOptions, partyUtils } from './partyUtils';

/**
 * Why a submission cannot be expressed as a {@link Party} and has to keep using the mappers that
 * predate the party model. Every reason is registered in
 * https://github.com/navikt/skjemabygging-formio/issues/2180, which tracks what has to be decided
 * before the legacy path can be removed.
 */
type LegacyPartyReason =
  /** L3: the submission carries flat applicant fields instead of a yourInformation container. */
  | 'legacyFields'
  /** L4, L7: the address holds a combination the party model deliberately cannot express. */
  | 'unsupportedAddress'
  /** L1, L2, L5, L6: the submission is missing or malforms something a party requires. */
  | 'incompleteParty';

type NavFormParty =
  { readonly type: 'party'; readonly party: Party } | { readonly type: 'legacy'; readonly reason: LegacyPartyReason };

/** Flat applicant fields from forms built before the yourInformation container existed. */
const LEGACY_FIELD_KEYS = [
  'fornavnSoker',
  'etternavnSoker',
  'coSoker',
  'postnummerSoker',
  'postnrSoker',
  'utenlandskPostkodeSoker',
  'poststedSoker',
  'landSoker',
  'gateadresseSoker',
  'norskVegadresse',
  'norskPostboksadresse',
  'utenlandskAdresse',
  'fodselsnummerDNummerSoker',
  'fornavnAvsender',
  'etternavnAvsender',
] as const;

const hasLegacyFields = (submissionData: SubmissionData) =>
  LEGACY_FIELD_KEYS.some((key) => submissionData[key] !== undefined && submissionData[key] !== '');

/** An address the party model would silently narrow, so the legacy mappers keep it whole. */
const isUnsupportedAddress = (address: SubmissionAddress | undefined) => {
  if (!address) {
    return false;
  }
  const bothAddressKinds = !!address.adresse && !!address.postboks;
  const foreignPostOfficeBox = addressUtils.resolveAddressType(address) === 'FOREIGN_ADDRESS' && !!address.postboks;
  return bothAddressKinds || foreignPostOfficeBox;
};

const toAddressDraft = (address: SubmissionAddress | undefined): Draft<PartyAddress> | undefined => {
  const type = addressUtils.resolveAddressType(address);
  if (!address || !type) {
    return undefined;
  }
  switch (type) {
    case 'FOREIGN_ADDRESS':
      return {
        type,
        co: address.co,
        street: address.adresse,
        building: address.bygning,
        postalCode: address.postnummer,
        location: address.bySted,
        region: address.region,
        country: { code: address.land?.value ?? address.landkode, name: address.land?.label },
      };
    case 'POST_OFFICE_BOX':
      return {
        type,
        co: address.co,
        postOfficeBox: address.postboks,
        postalCode: address.postnummer,
        postalName: address.bySted,
      };
    case 'NORWEGIAN_ADDRESS':
      return {
        type,
        co: address.co,
        street: address.adresse,
        postalCode: address.postnummer,
        postalName: address.bySted,
      };
  }
};

const toNameDraft = (firstName?: string, surname?: string) =>
  firstName || surname ? { firstName, surname } : undefined;

const toUserDraft = (yourInformation: SubmissionYourInformation | undefined): Draft<ConcernedUser> | undefined => {
  const name = toNameDraft(yourInformation?.fornavn, yourInformation?.etternavn);
  const nationalIdentityNumber = yourInformation?.identitet?.identitetsnummer;
  if (nationalIdentityNumber) {
    return { type: 'identified', nationalIdentityNumber, name };
  }
  return { type: 'unidentified', name, address: toAddressDraft(yourInformation?.adresse) };
};

const toSenderDraft = (sender: SubmissionSender | undefined): Draft<Sender> | undefined => {
  const person = sender?.person;
  if (!person) {
    return undefined;
  }
  const name = toNameDraft(person.firstName, person.surname);
  return person.nationalIdentityNumber
    ? { type: 'identified', nationalIdentityNumber: person.nationalIdentityNumber, name }
    : { type: 'named', name };
};

const toPartyDraft = (form: NavFormType | Form, submissionData: SubmissionData): PartyDraft => {
  const yourInformation = yourInformationUtils.getYourInformation(form, submissionData);
  const sender = senderUtils.getSender(form, submissionData);
  const user = toUserDraft(yourInformation);

  if (sender?.organization) {
    return {
      on: 'behalfOfOrg',
      sender: toSenderDraft(sender),
      organization: { name: sender.organization.name, organizationNumber: sender.organization.number },
      user,
    };
  }
  const senderDraft = toSenderDraft(sender);
  if (senderDraft) {
    return { on: 'behalfOfOther', sender: senderDraft, user };
  }
  if (user?.type === 'identified') {
    return { on: 'ownBehalf', person: user };
  }
  // Filling in for yourself without identifying yourself makes you your own sender, which is how the
  // submission has always been forwarded.
  return { on: 'behalfOfOther', sender: { type: 'named', name: user?.name }, user };
};

/**
 * Reads a NavForm submission as a party, or reports that it has to keep using the legacy mappers.
 *
 * Anything the party model cannot hold without losing or inventing data is routed to the legacy
 * path, so adopting the model never changes what an existing form sends.
 */
const getNavFormParty = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
  options: ParseOptions = {},
): NavFormParty => {
  if (hasLegacyFields(submissionData)) {
    return { type: 'legacy', reason: 'legacyFields' };
  }
  const yourInformation = yourInformationUtils.getYourInformation(form, submissionData);
  if (isUnsupportedAddress(yourInformation?.adresse)) {
    return { type: 'legacy', reason: 'unsupportedAddress' };
  }
  const parsed = partyUtils.parseParty(toPartyDraft(form, submissionData), options);
  return parsed.ok ? { type: 'party', party: parsed.value } : { type: 'legacy', reason: 'incompleteParty' };
};

const navFormPartyAdapter = {
  getNavFormParty,
  toPartyDraft,
};

export { navFormPartyAdapter };
export type { LegacyPartyReason, NavFormParty };

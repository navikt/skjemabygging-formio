import {
  ConcernedPerson,
  Form,
  LegacySender,
  Party,
  PartyAddress,
  Submission,
  SubmissionAddress,
  SubmissionYourInformation,
} from '../../models';
import { navFormUtils } from '../form';
import { senderUtils } from '../submission/senderUtils';
import { yourInformationUtils } from '../submission/yourInformationUtils';
import { legacyFlatPersonalInfoUtils } from './legacyFlatPersonalInfoUtils';

interface PartyResolutionOptions {
  navUnit?: string;
}

const toPartyAddress = (address?: SubmissionAddress): PartyAddress | undefined =>
  address
    ? {
        co: address.co,
        postOfficeBox: address.postboks,
        streetAddress: address.adresse,
        building: address.bygning,
        postalCode: address.postnummer,
        postalName: address.bySted,
        region: address.region,
        country: address.land,
      }
    : undefined;

const toConcernedUser = (yourInformation?: SubmissionYourInformation): ConcernedPerson | undefined => {
  if (yourInformation?.identitet?.identitetsnummer) {
    return { kind: 'identified-person', nationalIdentityNumber: yourInformation.identitet.identitetsnummer };
  }

  return yourInformation
    ? {
        kind: 'unidentified-person',
        firstName: yourInformation.fornavn,
        surname: yourInformation.etternavn,
        address: toPartyAddress(yourInformation.adresse),
      }
    : undefined;
};

const getLegacySender = (form: Form, submission: Submission): LegacySender | undefined => {
  const { fornavnAvsender: firstName, etternavnAvsender: surname } = submission.data;

  return firstName &&
    surname &&
    navFormUtils.hasComponent(form, 'fornavnAvsender') &&
    navFormUtils.hasComponent(form, 'etternavnAvsender')
    ? { firstName, surname }
    : undefined;
};

const selectConcernedPerson = (
  canonicalUser?: ConcernedPerson,
  flatUser?: ConcernedPerson,
): ConcernedPerson | undefined => {
  if (canonicalUser?.kind === 'identified-person') {
    return canonicalUser;
  }

  if (flatUser?.kind === 'identified-person') {
    return flatUser;
  }

  return canonicalUser ?? flatUser;
};

/**
 * Resolves who is responsible for a submission and who it concerns.
 * Returns undefined when the submitted user values are incomplete.
 */
const resolveParty = (form: Form, submission: Submission, options: PartyResolutionOptions = {}): Party | undefined => {
  const submittedSender = senderUtils.getSender(form, submission.data);
  const submittedUser = yourInformationUtils.getYourInformation(form, submission.data);
  const canonicalUser = toConcernedUser(submittedUser);
  const flatUser = legacyFlatPersonalInfoUtils.getConcernedPerson(form, submission.data);
  const user = selectConcernedPerson(canonicalUser, flatUser);

  if (submittedSender?.person) {
    return user ? { onBehalfOf: 'other-person', sender: submittedSender.person, user } : undefined;
  }

  if (submittedSender?.organization) {
    const sender = submittedSender.organization;

    if (user) {
      return { onBehalfOf: 'other-person', sender, user };
    }

    return options.navUnit
      ? { onBehalfOf: 'multiple-people', sender, navUnit: options.navUnit }
      : { onBehalfOf: 'self', user: sender };
  }

  if (!user) {
    return undefined;
  }

  const legacySender = getLegacySender(form, submission);
  if (legacySender) {
    return { onBehalfOf: 'other-person', sender: legacySender, user };
  }

  return { onBehalfOf: 'self', user };
};

export { resolveParty };
export type { PartyResolutionOptions };

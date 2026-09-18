import {
  ConcernedPerson,
  Form,
  isSenderPerson,
  LegacySender,
  Party,
  PartyAddress,
  SenderOrganization,
  SenderPerson,
  Submission,
  SubmissionAddress,
  SubmissionYourInformation,
} from '../../models';
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

const toConcernedPerson = (yourInformation?: SubmissionYourInformation): ConcernedPerson | undefined => {
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

const getLegacySender = (submission: Submission): LegacySender | undefined => {
  const { fornavnAvsender: firstName, etternavnAvsender: surname } = submission.data;

  return firstName && surname ? { firstName, surname } : undefined;
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

const resolveConcernedPerson = (form: Form, submission: Submission): ConcernedPerson | undefined => {
  const canonicalUser = toConcernedPerson(yourInformationUtils.getYourInformation(form, submission.data));
  const flatUser = legacyFlatPersonalInfoUtils.getConcernedUser(submission.data);

  return selectConcernedPerson(canonicalUser, flatUser);
};

const resolvePersonSenderParty = (sender: SenderPerson | LegacySender, user?: ConcernedPerson): Party | undefined => {
  if (user) {
    return { onBehalfOf: 'other-person', sender, user };
  }

  if (isSenderPerson(sender)) {
    return { onBehalfOf: 'self', sender };
  }

  return undefined;
};

const resolveOrganizationParty = (sender: SenderOrganization, user?: ConcernedPerson, navUnit?: string): Party => {
  if (user) {
    return { onBehalfOf: 'other-person', sender, user };
  }

  if (navUnit) {
    return { onBehalfOf: 'multiple-people', sender, navUnit };
  }

  return { onBehalfOf: 'self', sender };
};

/**
 * Resolves who is responsible for a submission and who it concerns.
 * Returns undefined when the submitted user values are incomplete.
 */
const resolveParty = (form: Form, submission: Submission, options: PartyResolutionOptions = {}): Party | undefined => {
  const user = resolveConcernedPerson(form, submission);
  const submittedSender = senderUtils.getSender(form, submission.data);

  if (submittedSender?.person) {
    return resolvePersonSenderParty(submittedSender.person, user);
  }

  if (submittedSender?.organization) {
    return resolveOrganizationParty(submittedSender.organization, user, options.navUnit);
  }

  const legacySender = getLegacySender(submission);
  if (legacySender) {
    return resolvePersonSenderParty(legacySender, user);
  }

  return user ? { onBehalfOf: 'self', user } : undefined;
};

export { resolveParty };
export type { PartyResolutionOptions };

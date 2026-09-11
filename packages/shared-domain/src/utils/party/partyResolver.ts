import {
  ConcernedPerson,
  Form,
  Party,
  PartyAddress,
  Submission,
  SubmissionAddress,
  SubmissionYourInformation,
} from '../../models';
import { senderUtils } from '../submission/senderUtils';
import { yourInformationUtils } from '../submission/yourInformationUtils';

const toPartyAddress = (address: SubmissionAddress): PartyAddress => ({
  co: address.co,
  postOfficeBox: address.postboks,
  streetAddress: address.adresse,
  building: address.bygning,
  postalCode: address.postnummer,
  postalName: address.bySted,
  region: address.region,
  country: address.land,
});

const toConcernedPerson = (yourInformation?: SubmissionYourInformation): ConcernedPerson | undefined => {
  if (!yourInformation) {
    return undefined;
  }

  const { fornavn, etternavn, identitet, adresse } = yourInformation;

  if (identitet?.identitetsnummer) {
    return { kind: 'identified-person', nationalIdentityNumber: identitet.identitetsnummer };
  }

  if (!fornavn || !etternavn || !adresse) {
    return undefined;
  }

  return {
    kind: 'unidentified-person',
    firstName: fornavn,
    surname: etternavn,
    address: toPartyAddress(adresse),
  };
};

/**
 * Resolves who is responsible for a submission and who it concerns.
 * Returns undefined when the submitted user values are incomplete.
 */
const resolveParty = (form: Form, submission: Submission): Party | undefined => {
  const submittedSender = senderUtils.getSender(form, submission.data);
  const submittedUser = yourInformationUtils.getYourInformation(form, submission.data);
  const user = toConcernedPerson(submittedUser);

  if (submittedUser && !user) {
    return undefined;
  }

  if (submittedSender?.person) {
    return user ? { onBehalfOf: 'other-person', sender: submittedSender.person, user } : undefined;
  }

  if (submittedSender?.organization) {
    const sender = {
      name: submittedSender.organization.name,
      organizationNumber: submittedSender.organization.number,
    };

    return user
      ? { onBehalfOf: 'other-person', sender, user }
      : { onBehalfOf: 'multiple-people', sender, user: { kind: 'multiple-people' } };
  }

  return user ? { onBehalfOf: 'self', user } : undefined;
};

export { resolveParty };

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
import { legacyFlatPersonalInfoUtils } from './legacyFlatPersonalInfoUtils';

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

/**
 * Resolves who is responsible for a submission and who it concerns.
 * Returns undefined when the submitted user values are incomplete.
 */
const resolveParty = (form: Form, submission: Submission): Party | undefined => {
  // Preserve legacy mapping for forms with flat personal information (formPath: olj000001, nav020807).
  if (legacyFlatPersonalInfoUtils.hasComponents(form)) {
    return undefined;
  }

  const submittedSender = senderUtils.getSender(form, submission.data);
  const submittedUser = yourInformationUtils.getYourInformation(form, submission.data);
  const user = toConcernedPerson(submittedUser);

  if (submittedSender?.person) {
    return user ? { onBehalfOf: 'other-person', sender: submittedSender.person, user } : undefined;
  }

  if (submittedSender?.organization) {
    const sender = {
      name: submittedSender.organization.name,
      organizationNumber: submittedSender.organization.number,
    };

    return user ? { onBehalfOf: 'other-person', sender, user } : { onBehalfOf: 'multiple-people', sender };
  }

  return user ? { onBehalfOf: 'self', user } : undefined;
};

export { resolveParty };

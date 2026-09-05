import { Form, SubmissionData, SubmissionSender, SubmissionYourInformation } from '../../models';
import { senderUtils, yourInformationUtils } from '../submission';
import { FyllutLegacySubmission, hasLegacyPersonSender, mapFyllutLegacyPartyAddress } from './fyllutLegacyPartyAdapter';
import { mapSubmissionAddress } from './partyAddress';
import { PartyValueLookup, PersonValue } from './partyResolver';

interface FyllutPartyLookupOptions {
  legacyIdentityFallback?: boolean;
}

const readYourInformation = (form: Form, submission: SubmissionData): SubmissionYourInformation | undefined =>
  yourInformationUtils.getYourInformation(form, submission);

const readSender = (form: Form, submission: SubmissionData): SubmissionSender | undefined =>
  senderUtils.getSender(form, submission);

const readUser = (form: Form, submission: SubmissionData, options: FyllutPartyLookupOptions): PersonValue => {
  const yourInformation = readYourInformation(form, submission);
  if (yourInformation) {
    const legacyIdentity = submission.fodselsnummerDNummerSoker;
    return {
      firstName: yourInformation.fornavn,
      surname: yourInformation.etternavn,
      nationalIdentityNumber:
        yourInformation.identitet?.identitetsnummer ||
        (options.legacyIdentityFallback && typeof legacyIdentity === 'string' ? legacyIdentity : undefined),
      address: yourInformation.adresse ? mapSubmissionAddress(yourInformation.adresse) : undefined,
    };
  }

  const legacy = submission as FyllutLegacySubmission;
  return {
    firstName: legacy.fornavnSoker,
    surname: legacy.etternavnSoker,
    nationalIdentityNumber: legacy.fodselsnummerDNummerSoker,
    address: legacy.fodselsnummerDNummerSoker ? undefined : mapFyllutLegacyPartyAddress(legacy),
  };
};

const createFyllutPartyLookup = (form: Form, options: FyllutPartyLookupOptions = {}): PartyValueLookup => ({
  relationship: (submission) => {
    const sender = readSender(form, submission.data);
    if (sender?.organization) {
      return 'organization';
    }
    if (sender?.person || hasLegacyPersonSender(submission.data as FyllutLegacySubmission)) {
      return 'other-person';
    }
    return 'self';
  },
  user: (submission) => readUser(form, submission.data, options),
  sender: (submission) => {
    const sender = readSender(form, submission.data);
    if (sender?.person) {
      return {
        firstName: sender.person.firstName,
        surname: sender.person.surname,
        nationalIdentityNumber: sender.person.nationalIdentityNumber,
      };
    }

    const legacy = submission.data as FyllutLegacySubmission;
    if (hasLegacyPersonSender(legacy)) {
      return {
        firstName: legacy.fornavnAvsender,
        surname: legacy.etternavnAvsender,
      };
    }
  },
  organization: (submission) => {
    const organization = readSender(form, submission.data)?.organization;
    if (organization) {
      return {
        name: organization.name,
        organizationNumber: organization.number,
      };
    }
  },
});

export { createFyllutPartyLookup };
export type { FyllutPartyLookupOptions };

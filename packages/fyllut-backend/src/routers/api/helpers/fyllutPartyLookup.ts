import {
  Form,
  PartyAddress,
  PartyValueLookup,
  senderUtils,
  SubmissionData,
  SubmissionSender,
  SubmissionYourInformation,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

const mapSubmissionAddress = (address: NonNullable<SubmissionYourInformation['adresse']>): PartyAddress => ({
  co: address.co,
  postOfficeBox: address.postboks,
  streetAddress: address.adresse,
  building: address.bygning,
  postalCode: address.postnummer,
  postalName: address.bySted,
  region: address.region,
  country: address.land,
});

const createFyllutPartyLookup = (form: Form): PartyValueLookup => {
  const readSender = (submission: SubmissionData): SubmissionSender | undefined =>
    senderUtils.getSender(form, submission);
  const readYourInformation = (submission: SubmissionData): SubmissionYourInformation | undefined =>
    yourInformationUtils.getYourInformation(form, submission);

  return {
    relationship: (submission) => {
      const sender = readSender(submission.data);
      if (sender?.organization) {
        return 'organization';
      }
      if (sender?.person) {
        return 'other-person';
      }
      return 'self';
    },
    user: (submission) => {
      const yourInformation = readYourInformation(submission.data);
      if (!yourInformation) {
        return undefined;
      }

      return {
        firstName: yourInformation.fornavn,
        surname: yourInformation.etternavn,
        nationalIdentityNumber: yourInformation.identitet?.identitetsnummer,
        address: yourInformation.adresse ? mapSubmissionAddress(yourInformation.adresse) : undefined,
      };
    },
    sender: (submission) => {
      const person = readSender(submission.data)?.person;
      return person
        ? {
            firstName: person.firstName,
            surname: person.surname,
            nationalIdentityNumber: person.nationalIdentityNumber,
          }
        : undefined;
    },
    organization: (submission) => {
      const organization = readSender(submission.data)?.organization;
      return organization
        ? {
            name: organization.name,
            organizationNumber: organization.number,
          }
        : undefined;
    },
  };
};

export { createFyllutPartyLookup };

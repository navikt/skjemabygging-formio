import {
  ConcernedPerson,
  Form,
  Party,
  PartyAddress,
  ResponsibleOrganization,
  ResponsiblePerson,
  Submission,
  SubmissionData,
  SubmissionSender,
  SubmissionYourInformation,
} from '../../models';
import { senderUtils } from '../submission/senderUtils';
import { yourInformationUtils } from '../submission/yourInformationUtils';

interface PersonValue {
  firstName?: string;
  surname?: string;
  nationalIdentityNumber?: string;
  address?: PartyAddress;
}

interface OrganizationValue {
  name?: string;
  organizationNumber?: string;
}

interface PartyInputValue {
  relationship: Party['relationship'];
  user?: PersonValue;
  sender?: PersonValue;
  organization?: OrganizationValue;
}

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

const getPartyValue = (form: Form, submission: SubmissionData): PartyInputValue => {
  const sender: SubmissionSender | undefined = senderUtils.getSender(form, submission);
  const yourInformation = yourInformationUtils.getYourInformation(form, submission);

  return {
    relationship: sender?.organization ? 'organization' : sender?.person ? 'other-person' : 'self',
    user: yourInformation
      ? {
          firstName: yourInformation.fornavn,
          surname: yourInformation.etternavn,
          nationalIdentityNumber: yourInformation.identitet?.identitetsnummer,
          address: yourInformation.adresse ? mapSubmissionAddress(yourInformation.adresse) : undefined,
        }
      : undefined,
    sender: sender?.person
      ? {
          firstName: sender.person.firstName,
          surname: sender.person.surname,
          nationalIdentityNumber: sender.person.nationalIdentityNumber,
        }
      : undefined,
    organization: sender?.organization
      ? {
          name: sender.organization.name,
          organizationNumber: sender.organization.number,
        }
      : undefined,
  };
};

const resolveConcernedPerson = (value: PersonValue | undefined): ConcernedPerson | undefined => {
  if (!value) {
    return undefined;
  }

  if (value.nationalIdentityNumber) {
    return {
      kind: 'identified-person',
      nationalIdentityNumber: value.nationalIdentityNumber,
    };
  }

  if (!value.firstName || !value.surname) {
    return undefined;
  }

  if (!value.address) {
    return undefined;
  }

  return {
    kind: 'unidentified-person',
    firstName: value.firstName,
    surname: value.surname,
    address: value.address,
  };
};

const resolveResponsiblePerson = (value: PersonValue | undefined): ResponsiblePerson | undefined => {
  if (!value?.firstName || !value.surname) {
    return undefined;
  }

  if (!value.nationalIdentityNumber) {
    return undefined;
  }

  return {
    firstName: value.firstName,
    surname: value.surname,
    nationalIdentityNumber: value.nationalIdentityNumber,
  };
};

const resolveOrganization = (value: OrganizationValue | undefined): ResponsibleOrganization | undefined => {
  if (!value?.name) {
    return undefined;
  }
  if (!value.organizationNumber) {
    return undefined;
  }

  return {
    name: value.name,
    organizationNumber: value.organizationNumber,
  };
};

const resolveParty = (form: Form, submission: Submission): Party | undefined => {
  const value = getPartyValue(form, submission.data);
  const relationship = value.relationship;
  const user = resolveConcernedPerson(value.user);
  if (!user) {
    return undefined;
  }

  if (relationship === 'self') {
    return { relationship, user };
  }
  if (relationship === 'other-person') {
    const sender = resolveResponsiblePerson(value.sender);
    if (!sender) {
      return undefined;
    }

    return {
      relationship,
      sender,
      user,
    };
  }
  const sender = resolveOrganization(value.organization);
  if (!sender) {
    return undefined;
  }

  return {
    relationship,
    sender,
    user,
  };
};

export { resolveParty };

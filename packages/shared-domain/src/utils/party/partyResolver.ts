import {
  ConcernedPerson,
  Party,
  PartyAddress,
  ResponsibleOrganization,
  ResponsiblePerson,
  Submission,
} from '../../models';

type PartyRelationship = Party['relationship'];

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

interface SeveralPeopleValue {
  kind: 'several-people';
}

type UserValue = PersonValue | SeveralPeopleValue;
type PartyValueReader<T> = (submission: Submission) => T | undefined;

interface PartyValueLookup {
  relationship: PartyValueReader<PartyRelationship>;
  user: PartyValueReader<UserValue>;
  sender?: PartyValueReader<PersonValue>;
  organization?: PartyValueReader<OrganizationValue>;
  navUnit?: PartyValueReader<string>;
}

interface PartyRuntimeContext {
  verifiedActor?: {
    nationalIdentityNumber: string;
  };
  allowedNavUnits?: readonly string[];
}

const resolveConcernedPerson = (value: UserValue | undefined): ConcernedPerson | undefined => {
  if (!value) {
    return undefined;
  }

  if ('kind' in value) {
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

const resolveResponsiblePerson = (
  value: PersonValue | undefined,
  context: PartyRuntimeContext,
): ResponsiblePerson | undefined => {
  if (!value?.firstName || !value.surname) {
    return undefined;
  }

  const nationalIdentityNumber = context.verifiedActor?.nationalIdentityNumber ?? value.nationalIdentityNumber;
  if (!nationalIdentityNumber) {
    return undefined;
  }

  return {
    firstName: value.firstName,
    surname: value.surname,
    nationalIdentityNumber,
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

const resolveSeveralPeople = (
  lookup: PartyValueLookup,
  submission: Submission,
  context: PartyRuntimeContext,
): Extract<Party, { relationship: 'organization' }>['user'] | undefined => {
  const navUnit = lookup.navUnit?.(submission);
  if (!navUnit) {
    return undefined;
  }
  if (!context.allowedNavUnits?.includes(navUnit)) {
    return undefined;
  }

  return {
    kind: 'several-people',
    navUnit,
  };
};

const resolveParty = (
  submission: Submission,
  lookup: PartyValueLookup,
  context: PartyRuntimeContext = {},
): Party | undefined => {
  const relationship = lookup.relationship(submission);
  if (!relationship) {
    return undefined;
  }

  const userValue = lookup.user(submission);
  if (relationship === 'organization' && userValue && 'kind' in userValue) {
    const sender = resolveOrganization(lookup.organization?.(submission));
    const user = resolveSeveralPeople(lookup, submission, context);
    if (!sender || !user) {
      return undefined;
    }

    return {
      relationship,
      sender,
      user,
    };
  }

  const user = resolveConcernedPerson(userValue);
  if (!user) {
    return undefined;
  }

  if (relationship === 'self') {
    return { relationship, user };
  }
  if (relationship === 'other-person') {
    const sender = resolveResponsiblePerson(lookup.sender?.(submission), context);
    if (!sender) {
      return undefined;
    }

    return {
      relationship,
      sender,
      user,
    };
  }
  const sender = resolveOrganization(lookup.organization?.(submission));
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
export type {
  OrganizationValue,
  PartyRelationship,
  PartyRuntimeContext,
  PartyValueLookup,
  PersonValue,
  SeveralPeopleValue,
  UserValue,
};

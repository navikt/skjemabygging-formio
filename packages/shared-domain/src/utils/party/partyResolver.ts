import {
  ConcernedPerson,
  Party,
  PartyAddress,
  ResponseError,
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

const resolveConcernedPerson = (value: UserValue | undefined): ConcernedPerson => {
  if (!value) {
    throw new ResponseError('BAD_REQUEST', 'Missing concerned user');
  }

  if ('kind' in value) {
    throw new ResponseError('BAD_REQUEST', 'Several people requires an organization sender');
  }

  if (value.nationalIdentityNumber) {
    return {
      kind: 'identified-person',
      nationalIdentityNumber: value.nationalIdentityNumber,
    };
  }

  if (!value.firstName || !value.surname) {
    throw new ResponseError('BAD_REQUEST', 'Missing concerned user name');
  }

  if (!value.address) {
    throw new ResponseError('BAD_REQUEST', 'Missing concerned user address');
  }

  return {
    kind: 'unidentified-person',
    firstName: value.firstName,
    surname: value.surname,
    address: value.address,
  };
};

const resolveResponsiblePerson = (value: PersonValue | undefined, context: PartyRuntimeContext): ResponsiblePerson => {
  if (!value?.firstName || !value.surname) {
    throw new ResponseError('BAD_REQUEST', 'Missing responsible sender name');
  }

  const nationalIdentityNumber = context.verifiedActor?.nationalIdentityNumber ?? value.nationalIdentityNumber;
  if (!nationalIdentityNumber) {
    throw new ResponseError('BAD_REQUEST', 'Missing responsible sender identity number');
  }

  return {
    firstName: value.firstName,
    surname: value.surname,
    nationalIdentityNumber,
  };
};

const resolveOrganization = (value: OrganizationValue | undefined): ResponsibleOrganization => {
  if (!value?.name) {
    throw new ResponseError('BAD_REQUEST', 'Missing responsible organization name');
  }
  if (!value.organizationNumber) {
    throw new ResponseError('BAD_REQUEST', 'Missing responsible organization number');
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
): Extract<Party, { relationship: 'organization' }>['user'] => {
  const navUnit = lookup.navUnit?.(submission);
  if (!navUnit) {
    throw new ResponseError('BAD_REQUEST', 'Missing NAV unit');
  }
  if (!context.allowedNavUnits?.includes(navUnit)) {
    throw new ResponseError('BAD_REQUEST', 'NAV unit is not allowed');
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
    return {
      relationship,
      sender: resolveOrganization(lookup.organization?.(submission)),
      user: resolveSeveralPeople(lookup, submission, context),
    };
  }

  const user = resolveConcernedPerson(userValue);
  if (relationship === 'self') {
    return { relationship, user };
  }
  if (relationship === 'other-person') {
    return {
      relationship,
      sender: resolveResponsiblePerson(lookup.sender?.(submission), context),
      user,
    };
  }
  return {
    relationship,
    sender: resolveOrganization(lookup.organization?.(submission)),
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

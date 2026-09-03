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

type UserValue = PersonValue | { kind: 'several-people' };
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

type PartyResolutionErrorCode =
  | 'missing-relationship'
  | 'missing-user'
  | 'missing-user-address'
  | 'missing-user-name'
  | 'missing-sender'
  | 'missing-sender-identity'
  | 'missing-sender-name'
  | 'missing-organization'
  | 'missing-organization-name'
  | 'missing-organization-number'
  | 'missing-nav-unit'
  | 'nav-unit-not-allowed'
  | 'unsupported-user';

type PartyResolution =
  | {
      success: true;
      party: Party;
    }
  | {
      success: false;
      error: PartyResolutionErrorCode;
    };

const normalizeIdentifier = (value: string) => value.replace(/\s/g, '');

const resolveConcernedPerson = (
  value: UserValue | undefined,
): { success: true; user: ConcernedPerson } | { success: false; error: PartyResolutionErrorCode } => {
  if (!value) {
    return { success: false, error: 'missing-user' };
  }

  if ('kind' in value) {
    return { success: false, error: 'unsupported-user' };
  }

  const nationalIdentityNumber = normalizeIdentifier(value.nationalIdentityNumber ?? '');
  if (nationalIdentityNumber) {
    return {
      success: true,
      user: {
        kind: 'identified-person',
        nationalIdentityNumber,
      },
    };
  }

  if (!value.firstName || !value.surname) {
    return { success: false, error: 'missing-user-name' };
  }

  if (!value.address) {
    return { success: false, error: 'missing-user-address' };
  }

  return {
    success: true,
    user: {
      kind: 'unidentified-person',
      firstName: value.firstName,
      surname: value.surname,
      address: value.address,
    },
  };
};

const resolveResponsiblePerson = (
  value: PersonValue | undefined,
  context: PartyRuntimeContext,
): { success: true; sender: ResponsiblePerson } | { success: false; error: PartyResolutionErrorCode } => {
  if (!value) {
    return { success: false, error: 'missing-sender' };
  }

  if (!value.firstName || !value.surname) {
    return { success: false, error: 'missing-sender-name' };
  }

  const nationalIdentityNumber = normalizeIdentifier(
    context.verifiedActor?.nationalIdentityNumber ?? value.nationalIdentityNumber ?? '',
  );
  if (!nationalIdentityNumber) {
    return { success: false, error: 'missing-sender-identity' };
  }

  return {
    success: true,
    sender: {
      firstName: value.firstName,
      surname: value.surname,
      nationalIdentityNumber,
    },
  };
};

const resolveOrganization = (
  value: OrganizationValue | undefined,
): { success: true; sender: ResponsibleOrganization } | { success: false; error: PartyResolutionErrorCode } => {
  if (!value) {
    return { success: false, error: 'missing-organization' };
  }

  if (!value.name) {
    return { success: false, error: 'missing-organization-name' };
  }

  const organizationNumber = normalizeIdentifier(value.organizationNumber ?? '');
  if (!organizationNumber) {
    return { success: false, error: 'missing-organization-number' };
  }

  return {
    success: true,
    sender: {
      name: value.name,
      organizationNumber,
    },
  };
};

const resolveSeveralPeople = (
  lookup: PartyValueLookup,
  submission: Submission,
  context: PartyRuntimeContext,
): PartyResolution => {
  const navUnit = lookup.navUnit?.(submission);
  if (!navUnit) {
    return { success: false, error: 'missing-nav-unit' };
  }

  if (!context.allowedNavUnits?.includes(navUnit)) {
    return { success: false, error: 'nav-unit-not-allowed' };
  }

  const organization = resolveOrganization(lookup.organization?.(submission));
  if (!organization.success) {
    return organization;
  }

  return {
    success: true,
    party: {
      relationship: 'organization',
      sender: organization.sender,
      user: {
        kind: 'several-people',
        navUnit,
      },
    },
  };
};

const resolveParty = (
  submission: Submission,
  lookup: PartyValueLookup,
  context: PartyRuntimeContext = {},
): PartyResolution => {
  const relationship = lookup.relationship(submission);
  if (!relationship) {
    return { success: false, error: 'missing-relationship' };
  }

  const userValue = lookup.user(submission);
  if (relationship === 'organization' && userValue && 'kind' in userValue && userValue.kind === 'several-people') {
    return resolveSeveralPeople(lookup, submission, context);
  }

  const user = resolveConcernedPerson(userValue);
  if (!user.success) {
    return user;
  }

  if (relationship === 'self') {
    return {
      success: true,
      party: {
        relationship,
        user: user.user,
      },
    };
  }

  if (relationship === 'other-person') {
    const sender = resolveResponsiblePerson(lookup.sender?.(submission), context);
    if (!sender.success) {
      return sender;
    }

    return {
      success: true,
      party: {
        relationship,
        sender: sender.sender,
        user: user.user,
      },
    };
  }

  const organization = resolveOrganization(lookup.organization?.(submission));
  if (!organization.success) {
    return organization;
  }

  return {
    success: true,
    party: {
      relationship,
      sender: organization.sender,
      user: user.user,
    },
  };
};

export { resolveParty };
export type {
  OrganizationValue,
  PartyRelationship,
  PartyResolution,
  PartyResolutionErrorCode,
  PartyRuntimeContext,
  PartyValueLookup,
  PersonValue,
  UserValue,
};

import {
  ConcernedPerson,
  Party,
  PartyAddress,
  ResponsibleOrganization,
  ResponsiblePerson,
  Submission,
} from '../../models';
import { formatUtils } from '../format';
import { hasAddressValue, isText } from './partyAddress';

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

type PartyResolutionErrorCode =
  | 'invalid-relationship'
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
  | 'missing-allowed-nav-units'
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

const isPartyAddress = (value: unknown): value is PartyAddress =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && hasAddressValue(value as PartyAddress);
const isPartyRelationship = (value: unknown): value is PartyRelationship =>
  value === 'self' || value === 'other-person' || value === 'organization';
const isSeveralPeople = (value: UserValue): value is SeveralPeopleValue =>
  'kind' in value && value.kind === 'several-people';

const resolveConcernedPerson = (
  value: UserValue | undefined,
): { success: true; user: ConcernedPerson } | { success: false; error: PartyResolutionErrorCode } => {
  if (!value) {
    return { success: false, error: 'missing-user' };
  }

  if (isSeveralPeople(value)) {
    return { success: false, error: 'unsupported-user' };
  }

  const nationalIdentityNumber = formatUtils.removeAllSpaces(
    typeof value.nationalIdentityNumber === 'string' ? value.nationalIdentityNumber : '',
  );
  if (nationalIdentityNumber) {
    return {
      success: true,
      user: {
        kind: 'identified-person',
        nationalIdentityNumber,
      },
    };
  }

  if (!isText(value.firstName) || !isText(value.surname)) {
    return { success: false, error: 'missing-user-name' };
  }

  if (!isPartyAddress(value.address)) {
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

  if (!isText(value.firstName) || !isText(value.surname)) {
    return { success: false, error: 'missing-sender-name' };
  }

  const nationalIdentityNumber = formatUtils.removeAllSpaces(
    context.verifiedActor?.nationalIdentityNumber ??
      (typeof value.nationalIdentityNumber === 'string' ? value.nationalIdentityNumber : ''),
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

  if (!isText(value.name)) {
    return { success: false, error: 'missing-organization-name' };
  }

  const organizationNumber = formatUtils.removeAllSpaces(
    typeof value.organizationNumber === 'string' ? value.organizationNumber : '',
  );
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
  // The NAV unit is the concerned-user value for this variant, so it is resolved before the sender,
  // matching the user-then-sender precedence used for every other relationship.
  const navUnit = lookup.navUnit?.(submission);
  if (!navUnit) {
    return { success: false, error: 'missing-nav-unit' };
  }

  if (!context.allowedNavUnits) {
    return { success: false, error: 'missing-allowed-nav-units' };
  }

  if (!context.allowedNavUnits.includes(navUnit)) {
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
  if (!isPartyRelationship(relationship)) {
    return { success: false, error: 'invalid-relationship' };
  }

  const userValue = lookup.user(submission);
  if (relationship === 'organization' && userValue && isSeveralPeople(userValue)) {
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

export { isPartyRelationship, resolveParty };
export type {
  OrganizationValue,
  PartyRelationship,
  PartyResolution,
  PartyResolutionErrorCode,
  PartyRuntimeContext,
  PartyValueLookup,
  PersonValue,
  SeveralPeopleValue,
  UserValue,
};

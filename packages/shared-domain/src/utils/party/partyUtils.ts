import { idnr } from '@navikt/fnrvalidator';
import {
  ConcernedUser,
  ConcernedUserInput,
  Country,
  NavUnit,
  Organization,
  OrganizationInput,
  PartyAddress,
  PartyAddressInput,
  PartyData,
  PartyDisplayData,
  PartyInput,
  PartyValidationError,
  PartyValidationResult,
  Person,
  PersonInput,
  ResolvedPartyRoles,
} from '../../models';
import { validatorUtils } from '../form';

const withoutWhitespace = (value?: string): string | undefined => {
  const normalized = value?.replace(/\s/g, '');
  return normalized || undefined;
};

const optionalText = (value?: string): string | undefined => (value?.trim() ? value : undefined);

const requiredText = (value: string | undefined, path: string, errors: PartyValidationError[]) => {
  if (!value?.trim()) {
    errors.push({ code: 'required', path });
    return undefined;
  }
  return value;
};

const validateIdentityNumber = (
  value: string | undefined,
  path: string,
  errors: PartyValidationError[],
  required: boolean,
) => {
  const normalized = withoutWhitespace(value);
  if (!normalized) {
    if (required) {
      errors.push({ code: 'required', path });
    }
    return undefined;
  }
  if (idnr(normalized).status !== 'valid') {
    errors.push({ code: 'invalid', path });
    return undefined;
  }
  return normalized;
};

const validatePerson = (
  input: PersonInput | undefined,
  path: string,
  errors: PartyValidationError[],
  identityRequired = false,
): Person | undefined => {
  if (!input) {
    errors.push({ code: 'required', path });
    return undefined;
  }

  const nationalIdentityNumber = validateIdentityNumber(
    input.nationalIdentityNumber,
    `${path}.nationalIdentityNumber`,
    errors,
    identityRequired,
  );
  const hasName = Boolean(input.firstName?.trim() || input.surname?.trim());
  const nameRequired = hasName || !withoutWhitespace(input.nationalIdentityNumber);
  const firstName = nameRequired ? requiredText(input.firstName, `${path}.firstName`, errors) : undefined;
  const surname = nameRequired ? requiredText(input.surname, `${path}.surname`, errors) : undefined;

  if ((nameRequired && (!firstName || !surname)) || (identityRequired && !nationalIdentityNumber)) {
    return undefined;
  }
  return {
    type: 'person',
    ...(firstName && { firstName }),
    ...(surname && { surname }),
    ...(nationalIdentityNumber && { nationalIdentityNumber }),
  };
};

const validateOrganization = (
  input: OrganizationInput | undefined,
  path: string,
  errors: PartyValidationError[],
): Organization | undefined => {
  if (!input) {
    errors.push({ code: 'required', path });
    return undefined;
  }

  const name = requiredText(input.name, `${path}.name`, errors);
  const organizationNumber = withoutWhitespace(input.organizationNumber);
  if (!organizationNumber) {
    errors.push({ code: 'required', path: `${path}.organizationNumber` });
  } else if (!validatorUtils.isOrganizationNumber(organizationNumber)) {
    errors.push({ code: 'invalid', path: `${path}.organizationNumber` });
  }

  if (!name || !organizationNumber || !validatorUtils.isOrganizationNumber(organizationNumber)) {
    return undefined;
  }
  return { type: 'organization', name, organizationNumber };
};

const validateCountry = (
  input: { code?: string; name?: string } | undefined,
  path: string,
  errors: PartyValidationError[],
): Country | undefined => {
  const name = requiredText(input?.name, `${path}.name`, errors);
  return name ? { name, ...(optionalText(input?.code) && { code: input?.code }) } : undefined;
};

const validateAddress = (
  input: PartyAddressInput | undefined,
  path: string,
  errors: PartyValidationError[],
): PartyAddress | undefined => {
  if (!input) {
    errors.push({ code: 'required', path });
    return undefined;
  }

  if (input.type === 'norwegianStreet') {
    const street = requiredText(input.street, `${path}.street`, errors);
    const postalCode = requiredText(input.postalCode, `${path}.postalCode`, errors);
    const postalName = requiredText(input.postalName, `${path}.postalName`, errors);
    return street && postalCode && postalName
      ? { type: input.type, street, postalCode, postalName, ...(optionalText(input.co) && { co: input.co }) }
      : undefined;
  }

  if (input.type === 'norwegianPostOfficeBox') {
    const postOfficeBox = requiredText(input.postOfficeBox, `${path}.postOfficeBox`, errors);
    const postalCode = requiredText(input.postalCode, `${path}.postalCode`, errors);
    const postalName = requiredText(input.postalName, `${path}.postalName`, errors);
    return postOfficeBox && postalCode && postalName
      ? {
          type: input.type,
          postOfficeBox,
          postalCode,
          postalName,
          ...(optionalText(input.co) && { co: input.co }),
        }
      : undefined;
  }

  const street = requiredText(input.street, `${path}.street`, errors);
  const country = validateCountry(input.country, `${path}.country`, errors);
  return street && country
    ? {
        type: input.type,
        street,
        country,
        ...(optionalText(input.co) && { co: input.co }),
        ...(optionalText(input.building) && { building: input.building }),
        ...(optionalText(input.postalCode) && { postalCode: input.postalCode }),
        ...(optionalText(input.location) && { location: input.location }),
        ...(optionalText(input.region) && { region: input.region }),
      }
    : undefined;
};

const validateConcernedUser = (
  input: ConcernedUserInput | undefined,
  path: string,
  errors: PartyValidationError[],
): ConcernedUser | undefined => {
  if (!input) {
    errors.push({ code: 'required', path });
    return undefined;
  }
  if (input.type === 'severalPeople') {
    return input;
  }
  if (input.type === 'identified') {
    const nationalIdentityNumber = validateIdentityNumber(
      input.nationalIdentityNumber,
      `${path}.nationalIdentityNumber`,
      errors,
      true,
    );
    return nationalIdentityNumber
      ? {
          type: input.type,
          nationalIdentityNumber,
          ...(optionalText(input.firstName) && { firstName: input.firstName }),
          ...(optionalText(input.surname) && { surname: input.surname }),
        }
      : undefined;
  }

  const firstName = requiredText(input.firstName, `${path}.firstName`, errors);
  const surname = requiredText(input.surname, `${path}.surname`, errors);
  const address = validateAddress(input.address, `${path}.address`, errors);
  return firstName && surname && address ? { type: input.type, firstName, surname, address } : undefined;
};

const validateNavUnit = (
  input: PartyInput['navUnit'],
  path: string,
  errors: PartyValidationError[],
): NavUnit | undefined => {
  if (!input) {
    errors.push({ code: 'required', path });
    return undefined;
  }
  const number = requiredText(input.number, `${path}.number`, errors);
  return number ? { number, ...(optionalText(input.name) && { name: input.name }) } : undefined;
};

const addCombinationErrors = (input: PartyInput, errors: PartyValidationError[]) => {
  const { relationship, responsibleSender, concernedUser, navUnit } = input;
  if (!relationship) {
    errors.push({ code: 'required', path: 'relationship' });
    return;
  }

  const expectsOrganization = relationship === 'organization';
  if (responsibleSender && (responsibleSender.type === 'organization') !== expectsOrganization) {
    errors.push({ code: 'invalid', path: 'responsibleSender' });
  }

  if (relationship === 'self' && concernedUser?.type !== 'identified') {
    errors.push({ code: 'invalid', path: 'concernedUser' });
  }
  if (relationship === 'anotherPerson' && concernedUser?.type === 'severalPeople') {
    errors.push({ code: 'invalid', path: 'concernedUser' });
  }

  const severalPeople = relationship === 'organization' && concernedUser?.type === 'severalPeople';
  if (!severalPeople && navUnit) {
    errors.push({ code: 'notAllowed', path: 'navUnit' });
  }
};

const validateParty = (input: PartyInput): PartyValidationResult => {
  const errors: PartyValidationError[] = [];
  addCombinationErrors(input, errors);

  const personFillingIn = validatePerson(input.personFillingIn, 'personFillingIn', errors, input.relationship === 'self');
  const responsibleSender =
    input.relationship === 'organization'
      ? validateOrganization(
          input.responsibleSender?.type === 'organization' ? input.responsibleSender : undefined,
          'responsibleSender',
          errors,
        )
      : validatePerson(
          input.responsibleSender?.type === 'person' ? input.responsibleSender : undefined,
          'responsibleSender',
          errors,
        );
  const concernedUser = validateConcernedUser(input.concernedUser, 'concernedUser', errors);
  const navUnit =
    input.relationship === 'organization' && input.concernedUser?.type === 'severalPeople'
      ? validateNavUnit(input.navUnit, 'navUnit', errors)
      : undefined;

  if (
    input.relationship === 'self' &&
    personFillingIn?.nationalIdentityNumber &&
    concernedUser?.type === 'identified' &&
    personFillingIn.nationalIdentityNumber !== concernedUser.nationalIdentityNumber
  ) {
    errors.push({ code: 'mismatch', path: 'concernedUser.nationalIdentityNumber' });
  }

  if (errors.length || !input.relationship || !personFillingIn || !responsibleSender || !concernedUser) {
    return { success: false, errors };
  }
  return {
    success: true,
    data: {
      relationship: input.relationship,
      personFillingIn,
      responsibleSender,
      concernedUser,
      ...(navUnit && { navUnit }),
    },
  };
};

const resolvePartyRoles = (party: PartyData): ResolvedPartyRoles => {
  switch (party.relationship) {
    case 'self':
    case 'anotherPerson':
    case 'organization':
      return {
        relationship: party.relationship,
        personFillingIn: party.personFillingIn,
        responsibleSender: party.responsibleSender,
        concernedUser: party.concernedUser,
        ...(party.navUnit && { navUnit: party.navUnit }),
      };
  }
};

const toPartyDisplayData = (party: PartyData): PartyDisplayData => {
  const resolved = resolvePartyRoles(party);
  return {
    relationship: resolved.relationship,
    personFillingIn: resolved.personFillingIn,
    ...(resolved.responsibleSender.type === 'organization' && {
      responsibleOrganization: resolved.responsibleSender,
    }),
    concernedUser: resolved.concernedUser,
    ...(resolved.navUnit && { navUnit: resolved.navUnit }),
  };
};

const partyUtils = {
  resolvePartyRoles,
  toPartyDisplayData,
  validateParty,
};

export { partyUtils };

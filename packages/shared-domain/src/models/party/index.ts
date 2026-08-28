type PartyRelationship = 'self' | 'anotherPerson' | 'organization';

interface PersonInput {
  type: 'person';
  firstName?: string;
  surname?: string;
  nationalIdentityNumber?: string;
}

interface OrganizationInput {
  type: 'organization';
  name?: string;
  organizationNumber?: string;
}

interface CountryInput {
  code?: string;
  name?: string;
}

interface NorwegianStreetAddressInput {
  type: 'norwegianStreet';
  co?: string;
  street?: string;
  postalCode?: string;
  postalName?: string;
}

interface NorwegianPostOfficeBoxAddressInput {
  type: 'norwegianPostOfficeBox';
  co?: string;
  postOfficeBox?: string;
  postalCode?: string;
  postalName?: string;
}

interface ForeignAddressInput {
  type: 'foreign';
  co?: string;
  street?: string;
  building?: string;
  postalCode?: string;
  location?: string;
  region?: string;
  country?: CountryInput;
}

type PartyAddressInput = NorwegianStreetAddressInput | NorwegianPostOfficeBoxAddressInput | ForeignAddressInput;

interface IdentifiedPersonInput {
  type: 'identified';
  nationalIdentityNumber?: string;
  firstName?: string;
  surname?: string;
}

interface UnidentifiedPersonInput {
  type: 'unidentified';
  firstName?: string;
  surname?: string;
  address?: PartyAddressInput;
}

interface SeveralPeopleInput {
  type: 'severalPeople';
}

type ConcernedUserInput = IdentifiedPersonInput | UnidentifiedPersonInput | SeveralPeopleInput;

interface NavUnitInput {
  number?: string;
  name?: string;
}

interface PartyInput {
  relationship?: PartyRelationship;
  personFillingIn?: PersonInput;
  responsibleSender?: PersonInput | OrganizationInput;
  concernedUser?: ConcernedUserInput;
  navUnit?: NavUnitInput;
}

interface Person {
  type: 'person';
  firstName?: string;
  surname?: string;
  nationalIdentityNumber?: string;
}

interface Organization {
  type: 'organization';
  name: string;
  organizationNumber: string;
}

interface Country {
  code?: string;
  name: string;
}

interface NorwegianStreetAddress {
  type: 'norwegianStreet';
  co?: string;
  street: string;
  postalCode: string;
  postalName: string;
}

interface NorwegianPostOfficeBoxAddress {
  type: 'norwegianPostOfficeBox';
  co?: string;
  postOfficeBox: string;
  postalCode: string;
  postalName: string;
}

interface ForeignAddress {
  type: 'foreign';
  co?: string;
  street: string;
  building?: string;
  postalCode?: string;
  location?: string;
  region?: string;
  country: Country;
}

type PartyAddress = NorwegianStreetAddress | NorwegianPostOfficeBoxAddress | ForeignAddress;

interface IdentifiedPerson {
  type: 'identified';
  nationalIdentityNumber: string;
  firstName?: string;
  surname?: string;
}

interface UnidentifiedPerson {
  type: 'unidentified';
  firstName: string;
  surname: string;
  address: PartyAddress;
}

interface SeveralPeople {
  type: 'severalPeople';
}

type ConcernedUser = IdentifiedPerson | UnidentifiedPerson | SeveralPeople;

interface NavUnit {
  number: string;
  name?: string;
}

interface PartyData {
  relationship: PartyRelationship;
  personFillingIn: Person;
  responsibleSender: Person | Organization;
  concernedUser: ConcernedUser;
  navUnit?: NavUnit;
}

type PartyValidationErrorCode = 'required' | 'invalid' | 'notAllowed' | 'mismatch';

interface PartyValidationError {
  code: PartyValidationErrorCode;
  path: string;
}

type PartyValidationResult =
  | { success: true; data: PartyData }
  | { success: false; errors: PartyValidationError[] };

interface ResolvedPartyRoles {
  relationship: PartyRelationship;
  personFillingIn: Person;
  responsibleSender: Person | Organization;
  concernedUser: ConcernedUser;
  navUnit?: NavUnit;
}

interface PartyDisplayData {
  relationship: PartyRelationship;
  personFillingIn: Person;
  responsibleOrganization?: Organization;
  concernedUser: ConcernedUser;
  navUnit?: NavUnit;
}

export type {
  ConcernedUser,
  ConcernedUserInput,
  Country,
  CountryInput,
  ForeignAddress,
  ForeignAddressInput,
  IdentifiedPerson,
  IdentifiedPersonInput,
  NavUnit,
  NavUnitInput,
  NorwegianPostOfficeBoxAddress,
  NorwegianPostOfficeBoxAddressInput,
  NorwegianStreetAddress,
  NorwegianStreetAddressInput,
  Organization,
  OrganizationInput,
  PartyAddress,
  PartyAddressInput,
  PartyData,
  PartyDisplayData,
  PartyInput,
  PartyRelationship,
  PartyValidationError,
  PartyValidationErrorCode,
  PartyValidationResult,
  Person,
  PersonInput,
  ResolvedPartyRoles,
  SeveralPeople,
  SeveralPeopleInput,
  UnidentifiedPerson,
  UnidentifiedPersonInput,
};

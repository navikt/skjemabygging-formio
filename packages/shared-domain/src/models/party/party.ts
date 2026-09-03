interface PartyAddress {
  co?: string;
  postOfficeBox?: string;
  streetAddress?: string;
  building?: string;
  postalCode?: string;
  postalName?: string;
  region?: string;
  country?: {
    value: string;
    label: string;
  };
}

interface IdentifiedConcernedPerson {
  kind: 'identified-person';
  nationalIdentityNumber: string;
}

interface UnidentifiedConcernedPerson {
  kind: 'unidentified-person';
  firstName: string;
  surname: string;
  address: PartyAddress;
}

interface ResponsiblePerson {
  firstName: string;
  surname: string;
  nationalIdentityNumber: string;
}

interface ResponsibleOrganization {
  name: string;
  organizationNumber: string;
}

interface SeveralPeople {
  kind: 'several-people';
  navUnit: string;
}

type ConcernedPerson = IdentifiedConcernedPerson | UnidentifiedConcernedPerson;

type Party =
  | {
      relationship: 'self';
      user: ConcernedPerson;
    }
  | {
      relationship: 'other-person';
      sender: ResponsiblePerson;
      user: ConcernedPerson;
    }
  | {
      relationship: 'organization';
      sender: ResponsibleOrganization;
      user: ConcernedPerson | SeveralPeople;
    };

export type {
  ConcernedPerson,
  IdentifiedConcernedPerson,
  Party,
  PartyAddress,
  ResponsibleOrganization,
  ResponsiblePerson,
  SeveralPeople,
  UnidentifiedConcernedPerson,
};

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

interface MultiplePeople {
  kind: 'multiple-people';
}

type ConcernedPerson = IdentifiedConcernedPerson | UnidentifiedConcernedPerson;

type Party =
  | {
      onBehalfOf: 'self';
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'other-person';
      sender: ResponsiblePerson | ResponsibleOrganization;
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'multiple-people';
      sender: ResponsibleOrganization;
      user: MultiplePeople;
    };

export type {
  ConcernedPerson,
  IdentifiedConcernedPerson,
  MultiplePeople,
  Party,
  PartyAddress,
  ResponsibleOrganization,
  ResponsiblePerson,
  UnidentifiedConcernedPerson,
};

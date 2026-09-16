import type { SenderOrganization, SenderPerson } from '../submission/sender';

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
  firstName?: string;
  surname?: string;
  address?: PartyAddress;
}

type ConcernedPerson = IdentifiedConcernedPerson | UnidentifiedConcernedPerson;

interface LegacySender {
  firstName: string;
  surname: string;
}

type ConcernedUser = ConcernedPerson | SenderOrganization;

type Party =
  | {
      onBehalfOf: 'self';
      user: ConcernedUser;
    }
  | {
      onBehalfOf: 'other-person';
      sender: SenderPerson | SenderOrganization | LegacySender;
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'multiple-people';
      sender: SenderOrganization;
      navUnit?: string;
    };

export type {
  ConcernedPerson,
  ConcernedUser,
  IdentifiedConcernedPerson,
  LegacySender,
  Party,
  PartyAddress,
  UnidentifiedConcernedPerson,
};

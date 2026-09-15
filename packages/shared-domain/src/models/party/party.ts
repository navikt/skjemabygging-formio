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

type Party =
  | {
      onBehalfOf: 'self';
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'other-person';
      sender: SenderPerson | SenderOrganization;
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'multiple-people';
      sender: SenderOrganization;
    };

export type { ConcernedPerson, IdentifiedConcernedPerson, Party, PartyAddress, UnidentifiedConcernedPerson };

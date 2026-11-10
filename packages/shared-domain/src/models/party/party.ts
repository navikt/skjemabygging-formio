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

type PartySender = SenderPerson | SenderOrganization;

type Party =
  | {
      onBehalfOf: 'self';
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'self';
      sender: SenderPerson | SenderOrganization;
    }
  | {
      onBehalfOf: 'other-person';
      sender: PartySender;
      user: ConcernedPerson;
    }
  | {
      onBehalfOf: 'multiple-people';
      sender: SenderOrganization;
      navUnit?: string;
    };

const isSenderOrganization = (sender: PartySender): sender is SenderOrganization => 'number' in sender;

export { isSenderOrganization };
export type {
  ConcernedPerson,
  IdentifiedConcernedPerson,
  Party,
  PartyAddress,
  PartySender,
  UnidentifiedConcernedPerson,
};

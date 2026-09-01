import { Address } from '../address';

interface PersonName {
  readonly firstName: string;
  readonly surname: string;
}

/** A person Nav can look up. The name is only known when the journey collected it. */
interface IdentifiedPerson {
  readonly type: 'identified';
  readonly nationalIdentityNumber: string;
  readonly name?: PersonName;
}

/** A person Nav cannot look up, so the name is the only thing we know about them. */
interface NamedPerson {
  readonly type: 'named';
  readonly name: PersonName;
}

/**
 * A person Nav cannot look up, identified for case handling by name and address.
 *
 * The address is the submitted {@link Address}. Which fields an address type requires is enforced by
 * the address component when the address is collected, so the model requires the address to be
 * present without restating those rules.
 */
interface UnidentifiedPerson {
  readonly type: 'unidentified';
  readonly name: PersonName;
  readonly address: Address;
}

interface Organization {
  readonly type: 'organization';
  readonly name: string;
  readonly organizationNumber: string;
}

/** A group of people the submission concerns, handled by a Nav unit rather than per person. */
interface SeveralPeople {
  readonly type: 'severalPeople';
  readonly navUnit: NavUnit;
}

interface NavUnit {
  readonly number: string;
  readonly name?: string;
}

/** The person filling in and sending the submission. */
type Sender = IdentifiedPerson | NamedPerson;

/** The person the submission is about. */
type ConcernedUser = IdentifiedPerson | UnidentifiedPerson;

/**
 * Who is sending a submission, and who it is about.
 *
 * Every combination Nav accepts is a variant, so no combination of the fields below can express a
 * party we would have to reject. Anything that cannot be expressed here is not valid input.
 */
type Party =
  | {
      /** Sending about yourself. Requires identification, since nobody else vouches for who you are. */
      readonly on: 'ownBehalf';
      readonly person: IdentifiedPerson;
    }
  | {
      /** Sending about another person. */
      readonly on: 'behalfOfOther';
      readonly sender: Sender;
      readonly user: ConcernedUser;
    }
  | {
      /**
       * Sending on behalf of an organization, which may be about a group rather than one person.
       * The organization is the responsible sender, so naming the person filling in is optional.
       */
      readonly on: 'behalfOfOrg';
      readonly sender?: Sender;
      readonly organization: Organization;
      readonly user: ConcernedUser | SeveralPeople;
    };

type PartyOn = Party['on'];

type PartyErrorCode = 'required' | 'invalid' | 'notAllowed';

interface PartyError {
  readonly code: PartyErrorCode;
  readonly path: string;
}

type Parsed<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly errors: readonly PartyError[] };

export type {
  ConcernedUser,
  IdentifiedPerson,
  NamedPerson,
  NavUnit,
  Organization,
  Parsed,
  Party,
  PartyError,
  PartyErrorCode,
  PartyOn,
  PersonName,
  Sender,
  SeveralPeople,
  UnidentifiedPerson,
};

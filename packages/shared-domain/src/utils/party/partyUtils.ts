import {
  Address,
  ConcernedUser,
  Draft,
  IdentifiedPerson,
  NamedPerson,
  NavUnit,
  Organization,
  Parsed,
  Party,
  PartyDraft,
  PartyError,
  PartyErrorCode,
  PersonName,
  Sender,
  SeveralPeople,
  UnidentifiedPerson,
} from '../../models';
import { validatorUtils } from '../form/validatorUtils';
import { formatUtils } from '../format';

interface ParseOptions {
  /** Synthetic identity numbers only exist outside production, so the caller decides. */
  readonly allowSyntheticIdentityNumbers?: boolean;
}

const failure = (code: PartyErrorCode, path: string): Parsed<never> => ({ ok: false, errors: [{ code, path }] });

const success = <T>(value: T): Parsed<T> => ({ ok: true, value });

const errorsOf = (parts: readonly Parsed<unknown>[]): readonly PartyError[] =>
  parts.flatMap((part) => (part.ok ? [] : part.errors));

/**
 * Builds a value from parsed parts, or collects every error the parts reported. Keeps parsing free
 * of an accumulator that each step has to push into.
 */
const combine = <T>(parts: readonly Parsed<unknown>[], build: () => T): Parsed<T> => {
  const errors = errorsOf(parts);
  return errors.length ? { ok: false, errors } : success(build());
};

const valueOf = <T>(parsed: Parsed<T>): T => (parsed as { value: T }).value;

const parseRequired = (value: string | undefined, path: string): Parsed<string> => {
  const trimmed = value?.trim();
  return trimmed ? success(trimmed) : failure('required', path);
};

const parseOptional = (value: string | undefined): string | undefined => value?.trim() || undefined;

const parseNationalIdentityNumber = (
  value: string | undefined,
  path: string,
  options: ParseOptions,
): Parsed<string> => {
  const required = parseRequired(value, path);
  if (!required.ok) {
    return required;
  }
  const digits = formatUtils.removeAllSpaces(valueOf(required));
  return validatorUtils.isNationalIdentityNumber(digits, { allowTestTypes: options.allowSyntheticIdentityNumbers })
    ? success(digits)
    : failure('invalid', path);
};

const parseName = (draft: Draft<PersonName> | undefined, path: string): Parsed<PersonName> => {
  const firstName = parseRequired(draft?.firstName, `${path}.firstName`);
  const surname = parseRequired(draft?.surname, `${path}.surname`);
  return combine([firstName, surname], () => ({
    firstName: valueOf(firstName),
    surname: valueOf(surname),
  }));
};

/**
 * An unidentified person must have an address, because a name and address is how they are
 * identifiable for case handling. Which fields the address holds is decided by the address
 * component when it is collected, so the address passes through as submitted.
 */
const parseAddress = (draft: Draft<Address> | undefined, path: string): Parsed<Address> =>
  draft ? success(draft) : failure('required', path);

const parseIdentifiedPerson = (
  draft: Draft<IdentifiedPerson>,
  path: string,
  options: ParseOptions,
): Parsed<IdentifiedPerson> => {
  const nationalIdentityNumber = parseNationalIdentityNumber(
    draft.nationalIdentityNumber,
    `${path}.nationalIdentityNumber`,
    options,
  );
  const name = draft.name ? parseName(draft.name, `${path}.name`) : undefined;
  return combine([nationalIdentityNumber, ...(name ? [name] : [])], () => ({
    type: 'identified',
    nationalIdentityNumber: valueOf(nationalIdentityNumber),
    ...(name ? { name: valueOf(name) } : {}),
  }));
};

const parseNamedPerson = (draft: Draft<NamedPerson>, path: string): Parsed<NamedPerson> => {
  const name = parseName(draft.name, `${path}.name`);
  return combine([name], () => ({ type: 'named', name: valueOf(name) }));
};

const parseUnidentifiedPerson = (draft: Draft<UnidentifiedPerson>, path: string): Parsed<UnidentifiedPerson> => {
  const name = parseName(draft.name, `${path}.name`);
  const address = parseAddress(draft.address, `${path}.address`);
  return combine([name, address], () => ({
    type: 'unidentified',
    name: valueOf(name),
    address: valueOf(address),
  }));
};

const parseNavUnit = (draft: Draft<NavUnit> | undefined, path: string): Parsed<NavUnit> => {
  const number = parseRequired(draft?.number, `${path}.number`);
  return combine([number], () => ({ number: valueOf(number), name: parseOptional(draft?.name) }));
};

const parseSeveralPeople = (draft: Draft<SeveralPeople>, path: string): Parsed<SeveralPeople> => {
  const navUnit = parseNavUnit(draft.navUnit, `${path}.navUnit`);
  return combine([navUnit], () => ({ type: 'severalPeople', navUnit: valueOf(navUnit) }));
};

const parseOrganization = (draft: Draft<Organization> | undefined, path: string): Parsed<Organization> => {
  const name = parseRequired(draft?.name, `${path}.name`);
  const number = parseRequired(draft?.organizationNumber, `${path}.organizationNumber`);
  const digits = number.ok ? formatUtils.removeAllSpaces(valueOf(number)) : undefined;
  const validNumber =
    digits === undefined || validatorUtils.isOrganizationNumber(digits)
      ? number
      : failure('invalid', `${path}.organizationNumber`);
  return combine([name, validNumber], () => ({
    type: 'organization',
    name: valueOf(name),
    organizationNumber: digits!,
  }));
};

const parseSender = (draft: Draft<Sender> | undefined, path: string, options: ParseOptions): Parsed<Sender> => {
  switch (draft?.type) {
    case 'identified':
      return parseIdentifiedPerson(draft, path, options);
    case 'named':
      return parseNamedPerson(draft, path);
    default:
      return failure('required', `${path}.type`);
  }
};

const parseConcernedUser = (
  draft: Draft<ConcernedUser> | undefined,
  path: string,
  options: ParseOptions,
): Parsed<ConcernedUser> => {
  switch (draft?.type) {
    case 'identified':
      return parseIdentifiedPerson(draft, path, options);
    case 'unidentified':
      return parseUnidentifiedPerson(draft, path);
    default:
      return failure('required', `${path}.type`);
  }
};

const parseConcernedUserOrSeveralPeople = (
  draft: Draft<ConcernedUser | SeveralPeople> | undefined,
  path: string,
  options: ParseOptions,
): Parsed<ConcernedUser | SeveralPeople> =>
  draft?.type === 'severalPeople'
    ? parseSeveralPeople(draft, path)
    : parseConcernedUser(draft as Draft<ConcernedUser> | undefined, path, options);

/**
 * Turns a half-filled party into a party, or reports every field that stops it from being one.
 *
 * Only the combinations Nav accepts are representable, so a successful parse needs no further check
 * of who may send on whose behalf.
 */
const parseParty = (draft: PartyDraft | undefined, options: ParseOptions = {}): Parsed<Party> => {
  switch (draft?.on) {
    case 'ownBehalf': {
      const person = parseIdentifiedPerson(draft.person ?? {}, 'person', options);
      return combine([person], () => ({ on: 'ownBehalf' as const, person: valueOf(person) }));
    }
    case 'behalfOfOther': {
      const sender = parseSender(draft.sender, 'sender', options);
      const user = parseConcernedUser(draft.user, 'user', options);
      return combine([sender, user], () => ({
        on: 'behalfOfOther' as const,
        sender: valueOf(sender),
        user: valueOf(user),
      }));
    }
    case 'behalfOfOrg': {
      const sender = draft.sender ? parseSender(draft.sender, 'sender', options) : undefined;
      const organization = parseOrganization(draft.organization, 'organization');
      const user = parseConcernedUserOrSeveralPeople(draft.user, 'user', options);
      return combine([...(sender ? [sender] : []), organization, user], () => ({
        on: 'behalfOfOrg' as const,
        ...(sender ? { sender: valueOf(sender) } : {}),
        organization: valueOf(organization),
        user: valueOf(user),
      }));
    }
    default:
      return failure('required', 'on');
  }
};

const partyUtils = {
  parseParty,
};

export { partyUtils };
export type { ParseOptions };

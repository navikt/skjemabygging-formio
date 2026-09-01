import {
  Address,
  ConcernedUser,
  IdentifiedPerson,
  NamedPerson,
  NavUnit,
  Organization,
  Parsed,
  Party,
  PartyError,
  PartyErrorCode,
  PersonName,
  Sender,
  SenderOrganization,
  SeveralPeople,
  SubmissionSender,
  SubmissionYourInformation,
} from '../../models';
import { validatorUtils } from '../form/validatorUtils';
import { formatUtils } from '../format';

interface ParseOptions {
  /** Synthetic identity numbers only exist outside production, so the caller decides. */
  readonly allowSyntheticIdentityNumbers?: boolean;
}

/**
 * What a party is parsed from: the sender component's value, the "Dine opplysninger" container's
 * value, and a NAV unit once a component exists to collect one. Each field reuses the existing
 * submission contract for that component instead of a second, party-specific input type, so any
 * host — fyllut today, sendinn later — parses a party from the same values its own components
 * already produce.
 */
interface PartyInput {
  readonly sender?: SubmissionSender;
  readonly yourInformation?: SubmissionYourInformation;
  readonly navUnit?: Partial<NavUnit>;
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

/** Reads the value of a part already known to be ok, since `combine` only calls `build` once it is. */
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

const parseName = (firstName: string | undefined, surname: string | undefined, path: string): Parsed<PersonName> => {
  const first = parseRequired(firstName, `${path}.firstName`);
  const last = parseRequired(surname, `${path}.surname`);
  return combine([first, last], () => ({ firstName: valueOf(first), surname: valueOf(last) }));
};

const parseIdentifiedPerson = (
  nationalIdentityNumber: string | undefined,
  firstName: string | undefined,
  surname: string | undefined,
  path: string,
  options: ParseOptions,
): Parsed<IdentifiedPerson> => {
  const id = parseNationalIdentityNumber(nationalIdentityNumber, `${path}.nationalIdentityNumber`, options);
  const name = firstName || surname ? parseName(firstName, surname, `${path}.name`) : undefined;
  return combine([id, ...(name ? [name] : [])], () => ({
    type: 'identified',
    nationalIdentityNumber: valueOf(id),
    ...(name ? { name: valueOf(name) } : {}),
  }));
};

const parseNamedPerson = (
  firstName: string | undefined,
  surname: string | undefined,
  path: string,
): Parsed<NamedPerson> => {
  const name = parseName(firstName, surname, `${path}.name`);
  return combine([name], () => ({ type: 'named', name: valueOf(name) }));
};

/**
 * An unidentified person must have an address, because a name and address is how they are
 * identifiable for case handling. Which fields the address holds is decided by the address
 * component when it is collected, so the address passes through as submitted.
 */
const parseAddress = (address: Address | undefined, path: string): Parsed<Address> =>
  address ? success(address) : failure('required', path);

const parseUnidentifiedPerson = (
  firstName: string | undefined,
  surname: string | undefined,
  address: Address | undefined,
  path: string,
) => {
  const name = parseName(firstName, surname, `${path}.name`);
  const parsedAddress = parseAddress(address, `${path}.address`);
  return combine([name, parsedAddress], () => ({
    type: 'unidentified' as const,
    name: valueOf(name),
    address: valueOf(parsedAddress),
  }));
};

/** A sender is only present when the sender component collected a person; an organization is not a `Sender`. */
const parseSender = (
  sender: SubmissionSender | undefined,
  path: string,
  options: ParseOptions,
): Parsed<Sender> | undefined => {
  const person = sender?.person;
  if (!person) {
    return undefined;
  }
  return person.nationalIdentityNumber
    ? parseIdentifiedPerson(person.nationalIdentityNumber, person.firstName, person.surname, path, options)
    : parseNamedPerson(person.firstName, person.surname, path);
};

const parseConcernedUser = (
  yourInformation: SubmissionYourInformation | undefined,
  path: string,
  options: ParseOptions,
): Parsed<ConcernedUser> => {
  const nationalIdentityNumber = yourInformation?.identitet?.identitetsnummer;
  return nationalIdentityNumber
    ? parseIdentifiedPerson(nationalIdentityNumber, yourInformation?.fornavn, yourInformation?.etternavn, path, options)
    : parseUnidentifiedPerson(yourInformation?.fornavn, yourInformation?.etternavn, yourInformation?.adresse, path);
};

const parseNavUnit = (navUnit: Partial<NavUnit> | undefined, path: string): Parsed<NavUnit> => {
  const number = parseRequired(navUnit?.number, `${path}.number`);
  return combine([number], () => ({ number: valueOf(number), name: parseOptional(navUnit?.name) }));
};

const parseSeveralPeople = (navUnit: Partial<NavUnit>, path: string): Parsed<SeveralPeople> => {
  const parsedNavUnit = parseNavUnit(navUnit, `${path}.navUnit`);
  return combine([parsedNavUnit], () => ({ type: 'severalPeople', navUnit: valueOf(parsedNavUnit) }));
};

const parseConcernedUserOrSeveralPeople = (
  input: PartyInput,
  path: string,
  options: ParseOptions,
): Parsed<ConcernedUser | SeveralPeople> =>
  input.navUnit ? parseSeveralPeople(input.navUnit, path) : parseConcernedUser(input.yourInformation, path, options);

const parseOrganization = (organization: SenderOrganization | undefined, path: string): Parsed<Organization> => {
  const name = parseRequired(organization?.name, `${path}.name`);
  const number = parseRequired(organization?.number, `${path}.organizationNumber`);
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

/**
 * Turns a party's sender, "Dine opplysninger", and NAV-unit input into a party, or reports every
 * field that stops it from being one.
 *
 * Only the combinations Nav accepts are representable, so a successful parse needs no further check
 * of who may send on whose behalf.
 */
const parseParty = (input: PartyInput, options: ParseOptions = {}): Parsed<Party> => {
  const { sender, yourInformation } = input;

  if (sender?.organization) {
    const organizationSender = parseSender(sender, 'sender', options);
    const organization = parseOrganization(sender.organization, 'organization');
    const user = parseConcernedUserOrSeveralPeople(input, 'user', options);
    return combine([...(organizationSender ? [organizationSender] : []), organization, user], () => ({
      on: 'behalfOfOrg' as const,
      ...(organizationSender ? { sender: valueOf(organizationSender) } : {}),
      organization: valueOf(organization),
      user: valueOf(user),
    }));
  }

  const explicitSender = parseSender(sender, 'sender', options);
  if (explicitSender) {
    const user = parseConcernedUser(yourInformation, 'user', options);
    return combine([explicitSender, user], () => ({
      on: 'behalfOfOther' as const,
      sender: valueOf(explicitSender),
      user: valueOf(user),
    }));
  }

  if (yourInformation?.identitet?.identitetsnummer) {
    const person = parseIdentifiedPerson(
      yourInformation.identitet.identitetsnummer,
      yourInformation.fornavn,
      yourInformation.etternavn,
      'person',
      options,
    );
    return combine([person], () => ({ on: 'ownBehalf' as const, person: valueOf(person) }));
  }

  // Filling in for yourself without identifying yourself makes you your own sender, which is how the
  // submission has always been forwarded.
  const selfSender = parseNamedPerson(yourInformation?.fornavn, yourInformation?.etternavn, 'sender');
  const user = parseConcernedUser(yourInformation, 'user', options);
  return combine([selfSender, user], () => ({
    on: 'behalfOfOther' as const,
    sender: valueOf(selfSender),
    user: valueOf(user),
  }));
};

const partyUtils = {
  parseParty,
};

export { partyUtils };
export type { ParseOptions, PartyInput };

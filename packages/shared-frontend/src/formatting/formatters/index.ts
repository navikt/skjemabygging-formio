import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * On-blur formatters. Each takes the raw user string and returns the component's default display
 * format. They are forgiving on input (accept several spacings) but normalize the output.
 */
type Formatter = (value: string) => string;

const digitsOnly = (value: string) => value.replace(/\s/g, '');

const iban: Formatter = (value) => formatUtils.formatIBAN(digitsOnly(value));

const accountNumber: Formatter = (value) => formatUtils.formatAccountNumber(digitsOnly(value));

const identityNumber: Formatter = (value) => {
  const digits = digitsOnly(value);
  return digits.length > 6 ? `${digits.slice(0, 6)} ${digits.slice(6)}` : digits;
};

const identityNumberRaw: Formatter = (value) => digitsOnly(value);

const phoneNumber: Formatter = (value) => digitsOnly(value);

const norwegianPhoneNumber: Formatter = (value) => formatUtils.formatPhoneNumber(digitsOnly(value), '+47');

const organizationNumber: Formatter = (value) => formatUtils.formatOrganizationNumber(digitsOnly(value));

const organizationNumberRaw: Formatter = (value) => digitsOnly(value);

const year: Formatter = (value) => digitsOnly(value);

const number: Formatter = (value) => {
  const cleaned = digitsOnly(value);
  if (cleaned === '' || Number.isNaN(Number(cleaned))) return cleaned;
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const decimal: Formatter = (value) => {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const [intPart, ...rest] = normalized.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return rest.length > 0 ? `${grouped},${rest.join('')}` : grouped;
};

const formatters: Record<string, Formatter> = {
  accountNumber,
  iban,
  identityNumber,
  identityNumberRaw,
  norwegianPhoneNumber,
  phoneNumber,
  organizationNumber,
  organizationNumberRaw,
  year,
  number,
  decimal,
};

const submissionFormatters: Record<string, Formatter> = {
  accountNumber: digitsOnly,
  identityNumber: digitsOnly,
  identityNumberRaw: digitsOnly,
  iban: digitsOnly,
  norwegianPhoneNumber: digitsOnly,
  organizationNumber: digitsOnly,
  organizationNumberRaw: digitsOnly,
  phoneNumber: digitsOnly,
  year: digitsOnly,
};

export {
  accountNumber,
  decimal,
  formatters,
  iban,
  identityNumber,
  identityNumberRaw,
  norwegianPhoneNumber,
  number,
  organizationNumber,
  organizationNumberRaw,
  phoneNumber,
  submissionFormatters,
  year,
};
export type { Formatter };

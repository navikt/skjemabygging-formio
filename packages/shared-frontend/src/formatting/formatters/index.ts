/**
 * On-blur formatters. Each takes the raw user string and returns the component's default display
 * format. They are forgiving on input (accept several spacings) but normalize the output.
 */
type Formatter = (value: string) => string;

const digitsOnly = (value: string) => value.replace(/\s/g, '');

const identityNumber: Formatter = (value) => {
  const digits = digitsOnly(value);
  return digits.length > 6 ? `${digits.slice(0, 6)} ${digits.slice(6)}` : digits;
};

const phoneNumber: Formatter = (value) => digitsOnly(value);

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
  identityNumber,
  phoneNumber,
  number,
  decimal,
};

export { decimal, formatters, identityNumber, number, phoneNumber };
export type { Formatter };

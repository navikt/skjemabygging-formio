import { Formatter, formatters } from './formatters';

/**
 * input <-> submission formatting contract:
 *  - never reformat while typing (onChange keeps the user's raw value),
 *  - reformat to the component default on blur,
 *  - convert submission value to input format when a field first shows on a page.
 *
 * Input and submission format are the same default string today, so a missing formatter is
 * identity. Components with their own format (number/decimal/identity/phone) provide a formatter.
 */
const toInputFormat = (value: unknown, formatKey?: string): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  const formatter = formatKey ? formatters[formatKey] : undefined;
  return formatter ? formatter(stringValue) : stringValue;
};

const toSubmissionFormat = (value: string, formatKey?: string): string => {
  const formatter: Formatter | undefined = formatKey ? formatters[formatKey] : undefined;
  return formatter ? formatter(value) : value;
};

export { toInputFormat, toSubmissionFormat };

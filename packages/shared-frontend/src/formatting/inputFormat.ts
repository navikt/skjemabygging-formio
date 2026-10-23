import { Formatter, formatters, submissionFormatters } from './formatters';

/**
 * input <-> submission formatting contract:
 *  - never reformat the *displayed* value while typing (the input keeps the user's raw keystrokes),
 *  - the value stored in state is trimmed and normalized to submission format on every change, so
 *    consumers (validation, conditionals, autosave) always see canonical data. Formatters are
 *    forgiving, so a partial/invalid value passes through ~unchanged until it becomes valid,
 *  - trim and reformat the displayed value to the component default on blur,
 *  - convert submission value to input format when a field first shows on a page.
 *
 * Input and submission format are the same default string today, so a missing formatter is
 * identity. Components with their own format (number/decimal/identity/phone) provide a formatter.
 */
const toInputFormat = (value: unknown, formatKey?: string): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value).trim();
  const formatter = formatKey ? formatters[formatKey] : undefined;
  return formatter ? formatter(stringValue) : stringValue;
};

const toSubmissionFormat = (value: string, formatKey?: string): string => {
  const trimmedValue = value.trim();
  const formatter: Formatter | undefined = formatKey
    ? (submissionFormatters[formatKey] ?? formatters[formatKey])
    : undefined;
  return formatter ? formatter(trimmedValue) : trimmedValue;
};

export { toInputFormat, toSubmissionFormat };

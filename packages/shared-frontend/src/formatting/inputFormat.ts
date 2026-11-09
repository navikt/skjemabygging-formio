import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formatter, formatters, submissionFormatters } from './formatters';

/**
 * input <-> submission formatting contract:
 *  - never reformat the *displayed* value while typing (the input keeps the user's raw keystrokes),
 *  - the value stored in state is trimmed and normalized to submission format on every change, so
 *    consumers (validation, conditionals, autosave) always see canonical data. Formatters are
 *    forgiving, so a partial/invalid value passes through ~unchanged until it becomes valid,
 *  - trim and reformat the displayed value to the component default on blur. Leaving an unanswered
 *    field empty stores nothing (see isChangedOnBlur),
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

/**
 * The number an entered value stands for, ignoring spaces and accepting a decimal comma, or
 * undefined when it is not a valid whole or decimal number. Callers keep an invalid value as text,
 * so validation can report it.
 */
const toSubmissionNumber = (value: string, isInteger: boolean): number | undefined => {
  const normalizedValue = isInteger ? value.replace(/\s/g, '') : value.replace(/\s/g, '').replace(',', '.');
  const isValid = isInteger ? numberUtils.isValidInteger(normalizedValue) : numberUtils.isValidDecimal(normalizedValue);
  return isValid ? Number(normalizedValue) : undefined;
};

/**
 * Whether leaving a field should store the value it shows. A field the user only focused and left
 * empty is still unanswered, so it gets no value.
 */
const isChangedOnBlur = (stateValue: unknown, nextStateValue: unknown): boolean => {
  const isStillUnanswered = (stateValue === undefined || stateValue === null) && nextStateValue === '';
  return !isStillUnanswered && !Object.is(stateValue, nextStateValue);
};

export { isChangedOnBlur, toInputFormat, toSubmissionFormat, toSubmissionNumber };

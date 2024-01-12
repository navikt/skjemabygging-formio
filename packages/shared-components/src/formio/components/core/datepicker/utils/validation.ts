import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import moment from 'moment/moment';

const validateBackwardsCompatible = (
  input,
  submissionData,
  beforeDateInputKey,
  mayBeEqual,
  relativeEarliestAllowedDate = '',
  relativeLatestAllowedDate = '',
  row,
  translate,
) => {
  if (!input) {
    return true;
  }

  let toAndFromDateValidation = true;
  if (beforeDateInputKey) {
    const beforeDateValue =
      submissionData[beforeDateInputKey] ||
      (beforeDateInputKey.includes('.') && row && row[beforeDateInputKey.replace(/.*\./i, '')]);
    if (beforeDateValue) {
      toAndFromDateValidation = validateToAndFromDate(moment(beforeDateValue), moment(input), mayBeEqual, translate);
    }
  }

  const earliestFromToday = String(relativeEarliestAllowedDate);
  const latestFromToday = String(relativeLatestAllowedDate);

  const earliestAndLatestDateValidation =
    !!earliestFromToday || !!latestFromToday
      ? validateEarliestAndLatestDate(earliestFromToday, latestFromToday, moment(input), translate)
      : true;

  if (typeof toAndFromDateValidation === 'string') {
    return toAndFromDateValidation;
  }
  if (typeof earliestAndLatestDateValidation === 'string') {
    return earliestAndLatestDateValidation;
  }
  return true;
};

const validate = (input, submissionData, component, row, translate) => {
  if (!input) {
    return true;
  }

  const result = validateBackwardsCompatible(
    input,
    submissionData,
    component.beforeDateInputKey,
    component.mayBeEqual,
    component.earliestAllowedDate,
    component.latestAllowedDate,
    row,
    translate,
  );
  if (result === true) {
    const { specificEarliestAllowedDate, specificLatestAllowedDate } = component;

    const earliest = specificEarliestAllowedDate ? moment(specificEarliestAllowedDate) : undefined;
    const latest = specificLatestAllowedDate ? moment(specificLatestAllowedDate) : undefined;
    return validateEarliestAndLatest(earliest, latest, moment(input), translate);
  }
  return result;
};

const validateEarliestAndLatestDate = (
  earliestFromToday: number | string = '',
  latestFromToday: number | string = '',
  inputDate,
  translate,
) => {
  const earliestAllowedDate = !!String(earliestFromToday) ? moment().add(String(earliestFromToday), 'd') : undefined;
  const latestAllowedDate = !!String(latestFromToday) ? moment().add(String(latestFromToday), 'd') : undefined;
  return validateEarliestAndLatest(earliestAllowedDate, latestAllowedDate, inputDate, translate);
};

const validateEarliestAndLatest = (earliestAllowedDate, latestAllowedDate, inputDate, translate) => {
  const getText = createTextGetter(translate);
  const earliestAllowedDateAsString = earliestAllowedDate ? earliestAllowedDate.format('DD.MM.YYYY') : '';
  const latestAllowedDateAsString = latestAllowedDate ? latestAllowedDate.format('DD.MM.YYYY') : '';
  if (earliestAllowedDate && latestAllowedDate) {
    if (!isCorrectOrder(earliestAllowedDate, latestAllowedDate, true)) {
      return true;
    }
    return inputDate.isBefore(earliestAllowedDate, 'd') || inputDate.isAfter(latestAllowedDate, 'd')
      ? `${getText('dateInBetween', {
          minDate: earliestAllowedDateAsString,
          maxDate: latestAllowedDateAsString,
        })}`
      : true;
  }

  if (earliestAllowedDate && inputDate.isBefore(earliestAllowedDate, 'd')) {
    return `${getText('dateNotBeforeAllowedDate')} ${earliestAllowedDateAsString}`;
  }

  if (latestAllowedDate && inputDate.isAfter(latestAllowedDate, 'd')) {
    return `${getText('dateNotLaterThanAllowedDate')} ${latestAllowedDateAsString}`;
  }

  return true;
};

const validateToAndFromDate = (beforeDate, inputDate, mayBeEqual, translate) => {
  const getText = createTextGetter(translate);
  if (isCorrectOrder(beforeDate, inputDate, mayBeEqual)) {
    return true;
  }
  const beforeDateAsString = beforeDate.format('DD.MM.YYYY');
  return mayBeEqual
    ? getText('dateNotBeforeFromDate', { fromDate: beforeDateAsString })
    : getText('dateAfterFromDate', { fromDate: beforeDateAsString });
};

const createTextGetter =
  (translate = (text: string, _params?: Record<string, string | number>): string => text) =>
  (key: string, params?: Record<string, string | number>) => {
    if (params) {
      return translate(key) === key ? translate(TEXTS.validering[key], params) : translate(key, params);
    }
    return translate(key) === key ? TEXTS.validering[key] : translate(key);
  };

const isCorrectOrder = (beforeDate, afterDate, mayBeEqual = false) => {
  return mayBeEqual ? beforeDate.isSameOrBefore(afterDate, 'd') : beforeDate.isBefore(afterDate, 'd');
};

export { validate, validateBackwardsCompatible, validateEarliestAndLatestDate, validateToAndFromDate };

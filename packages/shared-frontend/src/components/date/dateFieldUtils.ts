import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

const DATE_INPUT_LOCALE = 'nb-NO';
const DATE_INPUT_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const getAkselLocale = (currentLanguage: string) => {
  switch (currentLanguage) {
    case 'en':
      return 'en';
    case 'nn':
      return 'nn';
    default:
      return 'nb';
  }
};

const getMonthLocale = (currentLanguage: string) => {
  switch (currentLanguage) {
    case 'en':
      return 'en-US';
    case 'nn':
      return 'nn-NO';
    default:
      return 'nb-NO';
  }
};

const toDatePickerInputValue = (value: unknown) => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }

  if (dateUtils.isValid(value, 'submission')) {
    return new Intl.DateTimeFormat(DATE_INPUT_LOCALE, DATE_INPUT_FORMAT).format(dateUtils.toJSDate(value));
  }

  return value;
};

const toMonthPickerInputValue = (value: unknown, currentLanguage: string) => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }

  if (dateUtils.isValidMonthSubmission(value)) {
    return dateUtils.toLongMonthFormat(value, getMonthLocale(currentLanguage)) ?? '';
  }

  return value;
};

const toSelectedDate = (value: unknown) => {
  if (typeof value === 'string' && dateUtils.isValid(value, 'submission')) {
    return dateUtils.toJSDate(value);
  }

  return undefined;
};

const toSelectedMonth = (value: unknown) => {
  if (typeof value === 'string' && dateUtils.isValidMonthSubmission(value)) {
    return dateUtils.toJSDateFromMonthSubmission(value);
  }

  return undefined;
};

export {
  getAkselLocale,
  getMonthLocale,
  toDatePickerInputValue,
  toMonthPickerInputValue,
  toSelectedDate,
  toSelectedMonth,
};

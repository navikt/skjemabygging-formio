import {
  Component,
  Submission,
  dateUtils,
  numberUtils,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from '../../../context/form-definition/formDefinitionUtils';

const DATE_INPUT_LOCALE = 'nb-NO';

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

const normalizeArrayIndexes = (submissionPath: string) => submissionPath.replace(/\[\d+]/g, '');

const getCurrentRowPrefix = (submissionPath: string) => submissionPath.match(/^(.*\[\d+])(?:\.|$)/)?.[1];

const getBeforeDateInputSubmissionPath = (component: Component, pageComponents: Component[]) => {
  if (!component.beforeDateInputKey) {
    return undefined;
  }

  const currentPath = getResolvedSubmissionPath(component);
  const currentRowPrefix = getCurrentRowPrefix(currentPath);

  return flattenComponentsWithBaseSubmissionPath(pageComponents)
    .map((pageComponent) => getResolvedSubmissionPath(pageComponent))
    .find(
      (submissionPath) =>
        submissionPath !== currentPath &&
        normalizeArrayIndexes(submissionPath) === component.beforeDateInputKey &&
        (!currentRowPrefix || submissionPath.startsWith(currentRowPrefix)),
    );
};

const getDatePickerFromDate = (component: Component, pageComponents: Component[], submission?: Submission) => {
  if (component.beforeDateInputKey) {
    const beforeDateInputPath = getBeforeDateInputSubmissionPath(component, pageComponents);
    const beforeDateInputValue =
      beforeDateInputPath && submissionUtils.getSubmissionValue(beforeDateInputPath, submission);

    if (typeof beforeDateInputValue === 'string' && dateUtils.isValid(beforeDateInputValue, 'submission')) {
      return component.mayBeEqual ? beforeDateInputValue : dateUtils.addDays(1, beforeDateInputValue);
    }

    return undefined;
  }

  if (
    component.earliestAllowedDate !== undefined &&
    numberUtils.isValidInteger(String(component.earliestAllowedDate))
  ) {
    return dateUtils.addDays(Number(component.earliestAllowedDate));
  }

  return component.specificEarliestAllowedDate;
};

const getDatePickerToDate = (component: Component) => {
  if (component.latestAllowedDate !== undefined && numberUtils.isValidInteger(String(component.latestAllowedDate))) {
    return dateUtils.addDays(Number(component.latestAllowedDate));
  }

  return component.specificLatestAllowedDate;
};

const getMonthPickerMinYear = (component: Component) => {
  const minYear = component.validate?.minYear;
  if (minYear && String(minYear).length === 4 && numberUtils.isValidInteger(String(minYear))) {
    return minYear;
  }

  if (
    component.earliestAllowedDate !== undefined &&
    component.earliestAllowedDate !== '' &&
    numberUtils.isValidInteger(String(component.earliestAllowedDate))
  ) {
    return new Date().getFullYear() + Number(component.earliestAllowedDate);
  }

  return undefined;
};

const getMonthPickerMaxYear = (component: Component) => {
  const maxYear = component.validate?.maxYear;
  if (maxYear && String(maxYear).length === 4 && numberUtils.isValidInteger(String(maxYear))) {
    return maxYear;
  }

  if (
    component.latestAllowedDate !== undefined &&
    component.latestAllowedDate !== '' &&
    numberUtils.isValidInteger(String(component.latestAllowedDate))
  ) {
    return new Date().getFullYear() + Number(component.latestAllowedDate);
  }

  return undefined;
};

const toDatePickerInputValue = (value: unknown) => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }

  if (dateUtils.isValid(value, 'submission')) {
    return dateUtils.toJSDate(value).toLocaleDateString(DATE_INPUT_LOCALE);
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
  getDatePickerFromDate,
  getDatePickerToDate,
  getMonthLocale,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
  toDatePickerInputValue,
  toMonthPickerInputValue,
  toSelectedDate,
  toSelectedMonth,
};

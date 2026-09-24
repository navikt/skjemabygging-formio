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
} from '../context/form-definition/formDefinitionUtils';
import { ComponentDefinition, DateOffsetDefinition, DatePickerRangeDefinition } from './component-types';

const normalizeArrayIndexes = (submissionPath: string) => submissionPath.replace(/\[\d+]/g, '');

const getCurrentRowPrefix = (submissionPath: string) => submissionPath.match(/^(.*\[\d+])(?:\.|$)/)?.[1];

type DatePickerDefinitionInput = Component & DatePickerRangeDefinition;
type MonthPickerDefinitionInput = Component & DateOffsetDefinition;

const getBeforeDateInputSubmissionPath = (
  component: DatePickerDefinitionInput,
  pageComponents: ComponentDefinition[],
) => {
  if (!component.beforeDateInputKey) {
    return undefined;
  }

  const currentPath = getResolvedSubmissionPath(component);
  const currentRowPrefix = getCurrentRowPrefix(currentPath);
  const normalizedRowPrefix = currentRowPrefix ? normalizeArrayIndexes(currentRowPrefix) : undefined;

  if (
    currentRowPrefix &&
    normalizedRowPrefix &&
    (component.beforeDateInputKey === normalizedRowPrefix ||
      component.beforeDateInputKey.startsWith(`${normalizedRowPrefix}.`))
  ) {
    return `${currentRowPrefix}${component.beforeDateInputKey.slice(normalizedRowPrefix.length)}`;
  }

  return flattenComponentsWithBaseSubmissionPath(pageComponents)
    .map((pageComponent) => getResolvedSubmissionPath(pageComponent))
    .find(
      (submissionPath) =>
        submissionPath !== currentPath &&
        normalizeArrayIndexes(submissionPath) === component.beforeDateInputKey &&
        (!currentRowPrefix || submissionPath.startsWith(currentRowPrefix)),
    );
};

const getDatePickerFromDate = (
  component: DatePickerDefinitionInput,
  pageComponents: ComponentDefinition[],
  submission?: Submission,
) => {
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

const getDatePickerToDate = (component: DatePickerDefinitionInput) => {
  if (component.latestAllowedDate !== undefined && numberUtils.isValidInteger(String(component.latestAllowedDate))) {
    return dateUtils.addDays(Number(component.latestAllowedDate));
  }

  return component.specificLatestAllowedDate;
};

const getMonthPickerMinYear = (component: MonthPickerDefinitionInput) => {
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

const getMonthPickerMaxYear = (component: MonthPickerDefinitionInput) => {
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

export {
  getBeforeDateInputSubmissionPath,
  getDatePickerFromDate,
  getDatePickerToDate,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
};

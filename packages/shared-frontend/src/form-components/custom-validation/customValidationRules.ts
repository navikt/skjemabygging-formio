import { Component, Submission, dateUtils, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { DateMessages, ValidationRules } from '../../validation/validators';
import { ComponentDefinition } from '../component-types';
import { getBeforeDateInputSubmissionPath, getDatePickerFromDate, getDatePickerToDate } from '../dateDefinitionUtils';
import { CustomValidationRuleSpec, recognizeCustomValidation } from './customValidationScripts';

/**
 * What a recognized legacy expression needs in order to become plain value rules: the current
 * submission (for the value it compares against) and the components of the page (for the sibling a
 * date period is measured from). Both the rendered input adapter and the headless page rebuild have
 * these, which is what lets them produce identical rules.
 */
interface CustomValidationContext {
  submission?: Submission;
  pageComponents: ComponentDefinition[];
}

interface DateBound {
  date: string;
  message: string;
}

const laterDate = (date?: string, otherDate?: string) => {
  if (!date || !otherDate) {
    return date ?? otherDate;
  }
  return dateUtils.isBeforeDate(date, otherDate) ? otherDate : date;
};

const earlierDate = (date?: string, otherDate?: string) => {
  if (!date || !otherDate) {
    return date ?? otherDate;
  }
  return dateUtils.isBeforeDate(date, otherDate) ? date : otherDate;
};

/**
 * Combines the bounds the component is configured with and the bounds a legacy expression added.
 * Both applied in the old renderer, so the stricter one wins - and the authored message only
 * replaces the standard one when the authored bound is the one that actually narrows the range.
 */
const withStricterDateBounds = (
  configured: { fromDate?: string; toDate?: string },
  authored: { fromDate?: DateBound; toDate?: DateBound },
): ValidationRules => {
  const fromDate = laterDate(configured.fromDate, authored.fromDate?.date);
  const toDate = earlierDate(configured.toDate, authored.toDate?.date);
  const dateMessages: DateMessages = {
    ...(authored.fromDate && fromDate === authored.fromDate.date && fromDate !== configured.fromDate
      ? { fromDate: authored.fromDate.message }
      : {}),
    ...(authored.toDate && toDate === authored.toDate.date && toDate !== configured.toDate
      ? { toDate: authored.toDate.message }
      : {}),
  };

  return {
    fromDate,
    toDate,
    ...(Object.keys(dateMessages).length > 0 ? { dateMessages } : {}),
  };
};

const toDatePeriodRules = (
  component: Component,
  rule: Extract<CustomValidationRuleSpec, { type: 'datePeriod' }>,
  { submission, pageComponents }: CustomValidationContext,
): ValidationRules => {
  const fromDatePath = getBeforeDateInputSubmissionPath(component, pageComponents);
  const fromDateValue = fromDatePath ? submissionUtils.getSubmissionValue(fromDatePath, submission) : undefined;

  // `new Date(undefined)` made every comparison in the script false, so an unanswered start date
  // left the field valid. Nothing to add until the period has a start.
  if (typeof fromDateValue !== 'string' || !dateUtils.isValid(fromDateValue, 'submission')) {
    return {};
  }

  return withStricterDateBounds(
    {
      fromDate: getDatePickerFromDate(component, pageComponents, submission),
      toDate: getDatePickerToDate(component),
    },
    {
      // The script required the end date to be strictly after the start date, even where the
      // component itself allows them to be equal.
      fromDate: { date: dateUtils.addDays(1, fromDateValue), message: rule.afterMessage },
      toDate: { date: dateUtils.addDays(rule.maxDays, fromDateValue), message: rule.maxDaysMessage },
    },
  );
};

/**
 * The value rules that replace a component's `validate.custom`, with every referenced value already
 * resolved. Returns nothing for the scripts that are dropped (redundant or never validated), and
 * for anything unrecognized - such a form does not reach the new renderer at all.
 */
const resolveCustomValidationRules = (component: Component, context: CustomValidationContext): ValidationRules => {
  const recognized = recognizeCustomValidation(component);
  if (recognized.kind !== 'rules') {
    return {};
  }

  const { rule } = recognized;
  if (rule.type === 'notEqual') {
    return {
      notEqual: {
        value: submissionUtils.getSubmissionValue(rule.referencePath, context.submission),
        message: rule.message,
        comparison: rule.comparison,
      },
    };
  }

  return toDatePeriodRules(component, rule, context);
};

export { resolveCustomValidationRules, withStricterDateBounds };
export type { CustomValidationContext };

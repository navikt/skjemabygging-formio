import { Component, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import {
  enrichFormWithBaseSubmissionPath,
  toComponentDefinitions,
} from '../../context/form-definition/formDefinitionUtils';
import { collectPageValidationFields } from './collectPageValidationFields';

const startDate: Component = { key: 'startDate', label: 'Start date', type: 'navDatepicker', input: true };
const endDate: Component = {
  key: 'endDate',
  label: 'End date',
  type: 'navDatepicker',
  input: true,
  beforeDateInputKey: 'startDate',
};

const createForm = (start: Component, end: Component): Form =>
  enrichFormWithBaseSubmissionPath({
    title: 'Date references',
    path: 'datereferences',
    skjemanummer: 'datereferences',
    properties: {
      skjemanummer: 'datereferences',
      tema: 'BIL',
      submissionTypes: ['PAPER'],
      subsequentSubmissionTypes: [],
    },
    components: [
      { key: 'firstPage', label: 'First page', type: 'panel', components: [start] },
      { key: 'secondPage', label: 'Second page', type: 'panel', components: [end] },
    ],
  });

const collectEndDate = (form: Form, submission: Submission) =>
  collectPageValidationFields({
    components: toComponentDefinitions(form.components[1].components),
    form,
    submission,
    currentLanguage: 'nb',
  })[0];

describe('date validation fields', () => {
  it.each([
    { mayBeEqual: false, fromDate: '2025-01-16' },
    { mayBeEqual: true, fromDate: '2025-01-15' },
  ])('resolves cross-page bounds with mayBeEqual=$mayBeEqual', ({ mayBeEqual, fromDate }) => {
    const form = createForm(startDate, { ...endDate, mayBeEqual });

    expect(collectEndDate(form, { data: { startDate: '2025-01-15', endDate: '2025-01-14' } })).toMatchObject({
      statePath: 'endDate',
      value: '2025-01-14',
      rules: { date: true, fromDate },
    });
  });

  it('uses the latest start date when rebuilding an unmounted page', () => {
    const form = createForm(startDate, endDate);

    expect(collectEndDate(form, { data: { startDate: '2025-01-15' } }).rules.fromDate).toBe('2025-01-16');
    expect(collectEndDate(form, { data: { startDate: '2025-01-20' } }).rules.fromDate).toBe('2025-01-21');
    expect(collectEndDate(form, { data: {} }).rules.fromDate).toBeUndefined();
  });

  it('resolves the full submission path of a cross-page field inside a container', () => {
    const form = createForm(
      { key: 'period', label: 'Period', type: 'container', input: true, components: [startDate] },
      { ...endDate, beforeDateInputKey: 'period.startDate' },
    );

    expect(
      collectEndDate(form, { data: { startDate: '2025-03-01', period: { startDate: '2025-01-15' } } }).rules.fromDate,
    ).toBe('2025-01-16');
  });

  it.each(['', 'invalid', '2025-13-01'])('leaves the bound unset for an invalid start date: %s', (value) => {
    expect(
      collectEndDate(createForm(startDate, endDate), { data: { startDate: value } }).rules.fromDate,
    ).toBeUndefined();
  });

  it('does not use orphaned submission values for a reference missing from the form', () => {
    const form = createForm(startDate, { ...endDate, beforeDateInputKey: 'missingDate' });

    expect(collectEndDate(form, { data: { missingDate: '2025-01-15' } }).rules.fromDate).toBeUndefined();
  });

  it('resolves recognized custom date-period bounds across pages too', () => {
    const form = createForm(startDate, {
      ...endDate,
      mayBeEqual: true,
      validate: {
        custom: `
          var startday = new Date(row.startDate);
          var endday = new Date(row.endDate);
          var diffInTime = endday.getTime() - startday.getTime();
          var diffInDays = diffInTime / (1000 * 3600 * 24);
          if (endday <= startday) {
            valid = ((endday > startday) ? true : 'End must be after start');
          } else {
            if (diffInDays > 14) {
              valid = ((diffInDays <= 14) ? true : 'Period must not exceed 14 days');
            }
          }
        `,
      },
    });

    expect(collectEndDate(form, { data: { startDate: '2025-01-15' } }).rules).toMatchObject({
      fromDate: '2025-01-16',
      toDate: '2025-01-29',
      dateMessages: { fromDate: 'End must be after start', toDate: 'Period must not exceed 14 days' },
    });
  });
});

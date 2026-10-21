import { Component, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { enrichComponentsWithBaseSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { getDatePickerFromDate } from './dateDefinitionUtils';

describe('dateDefinitionUtils', () => {
  it('resolves beforeDateInputKey within the current datagrid row', () => {
    const formComponents = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'periods',
        label: 'Periods',
        type: 'datagrid',
        input: true,
        components: [
          { key: 'startDate', label: 'Start date', type: 'navDatepicker', input: true },
          {
            key: 'endDate',
            label: 'End date',
            type: 'navDatepicker',
            input: true,
            beforeDateInputKey: 'periods.startDate',
            mayBeEqual: false,
          },
        ],
      },
    ]);

    const submission: Submission = {
      data: {
        periods: [{ startDate: '2023-02-02' }, { startDate: '2023-03-10' }, {}],
      },
    };

    const fromDates = [0, 1, 2].map((index) => {
      const rowComponents = enrichComponentsWithBaseSubmissionPath(formComponents[0].components, `periods[${index}]`);
      return getDatePickerFromDate(rowComponents[1], formComponents, submission);
    });

    expect(fromDates).toEqual(['2023-02-03', '2023-03-11', undefined]);
  });

  it('resolves a cross-page root reference from inside a datagrid row', () => {
    const formComponents = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'firstPage',
        label: 'First page',
        type: 'panel',
        components: [{ key: 'startDate', label: 'Start date', type: 'navDatepicker', input: true }],
      },
    ]);
    const endDate: Component = {
      key: 'endDate',
      label: 'End date',
      type: 'navDatepicker',
      input: true,
      baseSubmissionPath: 'periods[1]',
      beforeDateInputKey: 'startDate',
    };
    const submission: Submission = {
      data: { startDate: '2023-02-02', periods: [{ startDate: '2023-04-01' }, {}] },
    };

    expect(getDatePickerFromDate(endDate, formComponents, submission)).toBe('2023-02-03');
  });

  it('keeps nested datagrid references in the current outer and inner row', () => {
    const endDate: Component = {
      key: 'endDate',
      label: 'End date',
      type: 'navDatepicker',
      input: true,
      baseSubmissionPath: 'groups[1].periods[0]',
      beforeDateInputKey: 'groups.periods.startDate',
      mayBeEqual: true,
    };
    const submission: Submission = {
      data: {
        groups: [
          { periods: [{ startDate: '2023-01-01' }] },
          { periods: [{ startDate: '2023-02-02' }, { startDate: '2023-03-03' }] },
        ],
      },
    };

    expect(getDatePickerFromDate(endDate, [], submission)).toBe('2023-02-02');
  });
});

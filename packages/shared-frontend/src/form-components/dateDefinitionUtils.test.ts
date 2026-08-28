import { Component, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { enrichComponentsWithBaseSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { getDatePickerFromDate } from './dateDefinitionUtils';

describe('dateDefinitionUtils', () => {
  it('resolves beforeDateInputKey within the current datagrid row', () => {
    const pageComponents = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'datagridDato',
        type: 'datagrid',
        input: true,
        components: [
          { key: 'gridFrom', type: 'navDatepicker', input: true },
          {
            key: 'gridTo',
            type: 'navDatepicker',
            input: true,
            beforeDateInputKey: 'datagridDato.gridFrom',
            mayBeEqual: false,
          },
        ],
      },
    ] as Component[]);

    const rowComponents = enrichComponentsWithBaseSubmissionPath(pageComponents[0].components ?? [], 'datagridDato[0]');
    const gridTo = rowComponents[1] as Component;
    const submission = {
      data: {
        datagridDato: [{ gridFrom: '2023-02-02' }],
      },
    } as Submission;

    expect(getDatePickerFromDate(gridTo, pageComponents, submission)).toBe('2023-02-03');
  });
});

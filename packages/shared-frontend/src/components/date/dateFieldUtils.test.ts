import { Component, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { enrichComponentsWithBaseSubmissionPath } from '../../context/form-definition/formDefinitionUtils';
import { getDatePickerFromDate, toDatePickerInputValue } from './dateFieldUtils';

describe('dateFieldUtils', () => {
  describe('toDatePickerInputValue', () => {
    it('formats submission dates as dd.MM.yyyy', () => {
      expect(toDatePickerInputValue('2025-06-01')).toBe('01.06.2025');
    });

    it('keeps typed input values unchanged', () => {
      expect(toDatePickerInputValue('01.06.2025')).toBe('01.06.2025');
    });
  });

  describe('getDatePickerFromDate', () => {
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

      const rowComponents = enrichComponentsWithBaseSubmissionPath(
        pageComponents[0].components ?? [],
        'datagridDato[0]',
      );
      const gridTo = rowComponents[1] as Component;
      const submission = {
        data: {
          datagridDato: [{ gridFrom: '2023-02-02' }],
        },
      } as Submission;

      expect(getDatePickerFromDate(gridTo, pageComponents, submission)).toBe('2023-02-03');
    });
  });
});

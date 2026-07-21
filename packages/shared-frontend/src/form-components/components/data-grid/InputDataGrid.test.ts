import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { enrichComponentsWithBaseSubmissionPath } from '../../../context/form-definition/formDefinitionUtils';
import { getActiveRowComponents } from './InputDataGrid';
import { addDataGridRowId, getRenderedDataGridRows, removeDataGridRowId, syncDataGridRowIds } from './dataGridRows';

const createForm = (components: Component[]): Form =>
  ({
    title: 'Test',
    path: 'test',
    components,
    properties: {
      submissionTypes: ['PAPER'],
    },
  }) as Form;

describe('InputDataGrid helpers', () => {
  it('renders one empty row by default when the datagrid has no saved rows', () => {
    expect(getRenderedDataGridRows([], undefined)).toEqual([{}]);
    expect(getRenderedDataGridRows([], true)).toEqual([]);
  });

  it('keeps remaining row ids stable when removing a row', () => {
    const initialRowIds = syncDataGridRowIds([], 2);
    const nextRowIds = removeDataGridRowId(initialRowIds, 0);

    expect(nextRowIds).toHaveLength(1);
    expect(nextRowIds[0]).toBe(initialRowIds[1]);
  });

  it('adds row ids without replacing existing rows', () => {
    const initialRowIds = syncDataGridRowIds([], 1);
    const nextRowIds = addDataGridRowId(initialRowIds);

    expect(nextRowIds).toHaveLength(2);
    expect(nextRowIds[0]).toBe(initialRowIds[0]);
    expect(nextRowIds[1]).toBeDefined();
    expect(nextRowIds[1]).not.toBe(initialRowIds[0]);
  });

  it('filters simple conditionals against row data', () => {
    const datagrid: Component = {
      key: 'repeterende',
      label: 'Repeterende',
      type: 'datagrid',
      navId: 'grid',
      components: [
        { key: 'showField', label: 'Show field', type: 'navCheckbox', navId: 'showField' },
        {
          key: 'field',
          label: 'Field',
          type: 'textfield',
          navId: 'field',
          conditional: { when: 'showField', eq: 'true', show: true },
        },
        {
          key: 'container',
          label: 'Container',
          type: 'container',
          navId: 'container',
          components: [
            {
              key: 'nestedField',
              label: 'Nested field',
              type: 'textfield',
              navId: 'nestedField',
              conditional: { when: 'showField', eq: 'true', show: true },
            },
          ],
        },
      ],
    };
    const form = createForm([datagrid]);
    const rowComponents = enrichComponentsWithBaseSubmissionPath(datagrid.components ?? [], 'repeterende[0]');

    const hidden = getActiveRowComponents(
      rowComponents,
      { showField: false },
      { repeterende: [{ showField: false }] },
      form,
    );
    expect(hidden.map((component) => component.key)).toEqual(['showField', 'container']);
    expect(hidden.find((component) => component.key === 'container')?.components).toEqual([]);

    const visible = getActiveRowComponents(
      rowComponents,
      { showField: true },
      { repeterende: [{ showField: true }] },
      form,
    );
    expect(visible.map((component) => component.key)).toEqual(['showField', 'field', 'container']);
    expect(
      visible.find((component) => component.key === 'container')?.components?.map((component) => component.key),
    ).toEqual(['nestedField']);
  });

  it('filters row-based custom conditionals against row data', () => {
    const datagrid: Component = {
      key: 'repeterende',
      label: 'Repeterende',
      type: 'datagrid',
      navId: 'grid',
      components: [
        { key: 'showField', label: 'Show field', type: 'navCheckbox', navId: 'showField' },
        {
          key: 'field',
          label: 'Field',
          type: 'textfield',
          navId: 'field',
          customConditional: 'show = row.showField === true',
        },
      ],
    };
    const form = createForm([datagrid]);
    const rowComponents = enrichComponentsWithBaseSubmissionPath(datagrid.components ?? [], 'repeterende[0]');

    expect(
      getActiveRowComponents(rowComponents, { showField: false }, { repeterende: [{ showField: false }] }, form).map(
        (component) => component.key,
      ),
    ).toEqual(['showField']);
    expect(
      getActiveRowComponents(rowComponents, { showField: true }, { repeterende: [{ showField: true }] }, form).map(
        (component) => component.key,
      ),
    ).toEqual(['showField', 'field']);
  });
});

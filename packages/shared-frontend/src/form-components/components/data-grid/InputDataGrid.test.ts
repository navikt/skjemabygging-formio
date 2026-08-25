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

  it('creates ids for rows added outside the datagrid controls', () => {
    const initialRowIds = syncDataGridRowIds([], 1);
    const synchronizedRowIds = syncDataGridRowIds(initialRowIds, 2);

    expect(synchronizedRowIds).toHaveLength(2);
    expect(synchronizedRowIds[0]).toBe(initialRowIds[0]);
    expect(synchronizedRowIds[1]).toBeDefined();
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

  it('filters nested custom conditionals against the nearest container row data', () => {
    const datagrid: Component = {
      key: 'kjaeledyr',
      label: 'Kjaeledyr',
      type: 'datagrid',
      navId: 'grid',
      components: [
        {
          key: 'egenskaper',
          label: 'Egenskaper',
          type: 'container',
          input: true,
          tree: true,
          navId: 'container',
          components: [
            { key: 'alder', label: 'Alder', type: 'textfield', navId: 'alder' },
            {
              key: 'brukerDyretMedisiner',
              label: 'Bruker dyret medisiner?',
              type: 'radiopanel',
              navId: 'medisiner',
              customConditional: 'show = row.alder ? parseInt(row.alder) >= 10 : false;',
            },
          ],
        },
      ],
    };
    const form = createForm([datagrid]);
    const rowComponents = enrichComponentsWithBaseSubmissionPath(datagrid.components ?? [], 'kjaeledyr[0]');

    const hidden = getActiveRowComponents(
      rowComponents,
      { egenskaper: { alder: '9' } },
      { kjaeledyr: [{ egenskaper: { alder: '9' } }] },
      form,
    );
    expect(
      hidden.find((component) => component.key === 'egenskaper')?.components?.map((component) => component.key),
    ).toEqual(['alder']);

    const visible = getActiveRowComponents(
      rowComponents,
      { egenskaper: { alder: '10' } },
      { kjaeledyr: [{ egenskaper: { alder: '10' } }] },
      form,
    );
    expect(
      visible.find((component) => component.key === 'egenskaper')?.components?.map((component) => component.key),
    ).toEqual(['alder', 'brukerDyretMedisiner']);
  });

  it('filters selectboxes-based custom conditionals against row data', () => {
    const datagrid: Component = {
      key: 'maltider',
      label: 'Maltider',
      type: 'datagrid',
      navId: 'grid',
      components: [
        {
          key: 'ingredienser',
          label: 'Ingredienser',
          type: 'selectboxes',
          navId: 'ingredienser',
          values: [
            { label: 'Melk', value: 'melk' },
            { label: 'Kefir', value: 'kefir' },
          ],
        },
        {
          key: 'kjopteDuVareneRettFraBonden',
          label: 'Kjopte du varene rett fra bonden?',
          type: 'radiopanel',
          navId: 'bonden',
          customConditional: 'show = row.ingredienser.melk || row.ingredienser.kefir;',
        },
      ],
    };
    const form = createForm([datagrid]);
    const rowComponents = enrichComponentsWithBaseSubmissionPath(datagrid.components ?? [], 'maltider[0]');

    expect(
      getActiveRowComponents(
        rowComponents,
        { ingredienser: { melk: false, kefir: false } },
        { maltider: [{ ingredienser: { melk: false, kefir: false } }] },
        form,
      ).map((component) => component.key),
    ).toEqual(['ingredienser']);
    expect(
      getActiveRowComponents(
        rowComponents,
        { ingredienser: { melk: true, kefir: false } },
        { maltider: [{ ingredienser: { melk: true, kefir: false } }] },
        form,
      ).map((component) => component.key),
    ).toEqual(['ingredienser', 'kjopteDuVareneRettFraBonden']);
  });
});

import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { deriveValidations } from './deriveValidations';

describe('deriveValidations', () => {
  it('builds descriptors only for input components with rules', () => {
    const components = [
      { key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } },
      { key: 'noRules', label: 'NoRules', input: true, type: 'textfield', validate: {} },
      { key: 'panel', input: false, type: 'panel' },
    ] as unknown as Component[];

    const result = deriveValidations(components);

    expect(result).toEqual([
      { submissionPath: 'name', field: 'Name', rules: { required: true, minLength: undefined, maxLength: undefined } },
    ]);
  });

  it('ignores empty-string lengths from form-builder defaults', () => {
    const components = [
      {
        key: 'a',
        label: 'A',
        input: true,
        type: 'textfield',
        validate: { required: true, maxLength: '', minLength: '' },
      },
    ] as unknown as Component[];
    expect(deriveValidations(components)[0].rules).toEqual({
      required: true,
      minLength: undefined,
      maxLength: undefined,
    });
  });

  it('falls back to key when label is missing', () => {
    const components = [
      { key: 'email', input: true, type: 'textfield', validate: { maxLength: 5 } },
    ] as unknown as Component[];
    expect(deriveValidations(components)[0].field).toBe('email');
  });

  it('uses nested submission paths for tree parents', () => {
    const components = [
      {
        key: 'container',
        type: 'container',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } }],
      },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'container.name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
    ]);
  });

  it('expands datagrid child validations per row', () => {
    const components = [
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } }],
      },
    ] as unknown as Component[];

    expect(deriveValidations(components, { data: { grid: [{ name: '' }, { name: 'Ada' }] } })).toEqual([
      {
        submissionPath: 'grid[0].name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
      {
        submissionPath: 'grid[1].name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
    ]);
  });

  it('adds simple email and number validation rules from component type', () => {
    const components = [
      { key: 'email', label: 'Email', input: true, type: 'email', validate: { required: true } },
      { key: 'amount', label: 'Amount', input: true, type: 'number', inputType: 'numeric', validate: { min: 1 } },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'email',
        field: 'Email',
        rules: {
          required: true,
          minLength: undefined,
          maxLength: undefined,
          email: true,
          coverPageValue: undefined,
          numberType: undefined,
          min: undefined,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
        },
      },
      {
        submissionPath: 'amount',
        field: 'Amount',
        rules: {
          required: undefined,
          minLength: undefined,
          maxLength: undefined,
          email: undefined,
          coverPageValue: undefined,
          numberType: 'integer',
          min: 1,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
        },
      },
    ]);
  });
});

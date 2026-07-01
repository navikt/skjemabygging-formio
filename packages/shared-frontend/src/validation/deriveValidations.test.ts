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
});

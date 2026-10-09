import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { resolveFieldSize, resolveSelectType, resolveValidation } from './inputComponentUtils';

const createComponent = (overrides: Partial<Component>): Component =>
  ({
    key: 'field',
    label: 'Field',
    type: 'textfield',
    ...overrides,
  }) as Component;

describe('resolveSelectType', () => {
  it('maps select to native select by default', () => {
    expect(resolveSelectType(createComponent({ type: 'select' }))).toBe('select');
  });

  it('maps navSelect to combobox by default', () => {
    expect(resolveSelectType(createComponent({ type: 'navSelect' }))).toBe('combobox');
  });

  it('prefers an explicit form-definition override', () => {
    expect(resolveSelectType(createComponent({ type: 'select', selectType: 'combobox' }))).toBe('combobox');
    expect(resolveSelectType(createComponent({ type: 'navSelect', selectType: 'select' }))).toBe('select');
  });
});

describe('resolveFieldSize', () => {
  it.each([
    ['input--xxs', 'xxsmall'],
    ['input--xs', 'xsmall'],
    ['input--s', 'small'],
    ['input--m', 'medium'],
    ['input--l', 'large'],
    ['input--xl', 'xlarge'],
    ['input--xxl', 'xxlarge'],
  ])('maps legacy %s to semantic %s', (legacySize, expectedSize) => {
    expect(resolveFieldSize(createComponent({ fieldSize: legacySize }))).toBe(expectedSize);
  });

  it('ignores missing and unsupported field sizes', () => {
    expect(resolveFieldSize(createComponent({}))).toBeUndefined();
    expect(resolveFieldSize(createComponent({ fieldSize: 'input--unknown' }))).toBeUndefined();
  });
});

describe('resolveValidation', () => {
  it('normalizes an authored pattern into an expression and the message written for it', () => {
    expect(
      resolveValidation(
        createComponent({ validate: { pattern: '\\d{2}:\\d{2}', customMessage: 'Skriv klokkeslett som HH:mm' } }),
      ).pattern,
    ).toEqual({ expression: '\\d{2}:\\d{2}', message: 'Skriv klokkeslett som HH:mm' });
  });

  it('falls back to the legacy pattern message', () => {
    expect(
      resolveValidation(createComponent({ validate: { pattern: '\\d{2}', patternMessage: 'Bruk to siffer' } })).pattern,
    ).toEqual({ expression: '\\d{2}', message: 'Bruk to siffer' });
  });

  it('keeps a pattern without a message, and has none when nothing was authored', () => {
    expect(resolveValidation(createComponent({ validate: { pattern: '\\d{2}' } })).pattern).toEqual({
      expression: '\\d{2}',
      message: undefined,
    });
    expect(resolveValidation(createComponent({ validate: { customMessage: 'Ugyldig' } })).pattern).toBeUndefined();
    expect(resolveValidation(createComponent({})).pattern).toBeUndefined();
  });

  it('maps only the numeric constraints the form builder actually authored', () => {
    // The form builder stores an unset numeric constraint as an empty string.
    const validate = { minLength: '', maxLength: 10, min: 1 } as unknown as Component['validate'];

    expect(resolveValidation(createComponent({ validate }))).toEqual({
      minLength: undefined,
      maxLength: 10,
      min: 1,
      max: undefined,
      minYear: undefined,
      maxYear: undefined,
      digitsOnly: undefined,
      pattern: undefined,
    });
  });

  it.each([
    ['{"min":"0","max":"180"}', { min: 0, max: 180 }],
    ['{"min":0,"max":"14"}', { min: 0, max: 14 }],
    [
      '{"minLength":"0","maxLength":"14","min":"-2.5","max":" 14.5 ","minYear":"1900","maxYear":"2030"}',
      { minLength: 0, maxLength: 14, min: -2.5, max: 14.5, minYear: 1900, maxYear: 2030 },
    ],
  ])('normalizes authored numeric constraints from %s without changing the definition', (json, expected) => {
    const validate: Component['validate'] = JSON.parse(json);
    const component = createComponent({ validate });

    expect(resolveValidation(component)).toMatchObject(expected);
    expect(component.validate).toEqual(JSON.parse(json));
  });

  it.each([
    '{"minLength":"","maxLength":" \\t ","min":"14px","max":"1e309","minYear":"NaN","maxYear":"Infinity"}',
    '{"minLength":null,"maxLength":false,"min":true,"max":[],"minYear":["2020"],"maxYear":{}}',
  ])('leaves empty and invalid authored constraints unset: %s', (json) => {
    const validate: Component['validate'] = JSON.parse(json);

    expect(resolveValidation(createComponent({ validate }))).toEqual({
      minLength: undefined,
      maxLength: undefined,
      min: undefined,
      max: undefined,
      minYear: undefined,
      maxYear: undefined,
      digitsOnly: undefined,
      pattern: undefined,
    });
  });

  it('leaves non-finite numeric constraints unset', () => {
    const validate = {
      minLength: Number.NaN,
      maxLength: Number.POSITIVE_INFINITY,
      min: Number.NEGATIVE_INFINITY,
      max: Number.NaN,
      minYear: Number.NEGATIVE_INFINITY,
      maxYear: Number.POSITIVE_INFINITY,
    };

    expect(resolveValidation(createComponent({ validate }))).toEqual({
      minLength: undefined,
      maxLength: undefined,
      min: undefined,
      max: undefined,
      minYear: undefined,
      maxYear: undefined,
      digitsOnly: undefined,
      pattern: undefined,
    });
  });
});

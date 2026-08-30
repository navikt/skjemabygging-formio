import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { resolveFieldSize, resolveNumberDisplayValue, resolveSelectType } from './inputComponentRegistryUtils';

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

describe('resolveNumberDisplayValue', () => {
  it('formats decimal numbers with two decimals for editable fields', () => {
    expect(resolveNumberDisplayValue(createComponent({ type: 'currency' }), 900)).toBe('900,00');
  });

  it('formats integer numbers without decimals for numeric fields', () => {
    expect(resolveNumberDisplayValue(createComponent({ type: 'currency', inputType: 'numeric' }), 900)).toBe('900');
  });
});

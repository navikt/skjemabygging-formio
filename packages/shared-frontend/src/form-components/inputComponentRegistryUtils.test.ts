import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { resolveSelectType } from './inputComponentRegistryUtils';

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

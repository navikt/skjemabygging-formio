import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { isLockedByPrefill, withPrefillLock } from './prefillLock';

const createComponent = (overrides: Partial<Component>): Component =>
  ({ key: 'field', label: 'Field', type: 'textfield', input: true, ...overrides }) as Component;

describe('prefillLock', () => {
  it('locks text-like components with a prefillKey in digital submissions', () => {
    const component = createComponent({ prefillKey: 'sokerFornavn' });

    expect(isLockedByPrefill(component, 'digital')).toBe(true);
    expect(withPrefillLock(component, 'digital').readOnly).toBe(true);
  });

  it('locks even when no prefill value was found', () => {
    expect(
      isLockedByPrefill(createComponent({ type: 'fnrfield', prefillKey: 'sokerIdentifikasjonsnummer' }), 'digital'),
    ).toBe(true);
  });

  it('does not lock paper submissions, missing prefillKey or other component types', () => {
    const component = createComponent({ prefillKey: 'sokerFornavn' });

    expect(isLockedByPrefill(component, 'paper')).toBe(false);
    expect(isLockedByPrefill(component, undefined)).toBe(false);
    expect(isLockedByPrefill(createComponent({}), 'digital')).toBe(false);
    expect(isLockedByPrefill(createComponent({ type: 'radiopanel', prefillKey: 'sokerFornavn' }), 'digital')).toBe(
      false,
    );
    expect(withPrefillLock(component, 'paper')).toBe(component);
  });
});

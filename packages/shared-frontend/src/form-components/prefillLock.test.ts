import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { isLockedByPrefill, withPrefillLock } from './prefillLock';

const createComponent = (overrides: Partial<Component>): Component =>
  ({ key: 'field', label: 'Field', type: 'textfield', input: true, ...overrides }) as Component;

describe('prefillLock', () => {
  it.each(['textfield', 'currency', 'year', 'radiopanel', 'navAddress', 'sender'])(
    'locks %s with a prefillKey in digital submissions',
    (type) => {
      const component = createComponent({ type, prefillKey: 'sokerFornavn' });

      expect(isLockedByPrefill(component, 'digital')).toBe(true);
      expect(withPrefillLock(component, 'digital').readOnly).toBe(true);
    },
  );

  it('locks even when no prefill value was found', () => {
    expect(
      isLockedByPrefill(createComponent({ type: 'fnrfield', prefillKey: 'sokerIdentifikasjonsnummer' }), 'digital'),
    ).toBe(true);
  });

  it('does not lock non-digital submissions or components without a prefillKey', () => {
    const component = createComponent({ prefillKey: 'sokerFornavn' });

    expect(isLockedByPrefill(component, 'paper')).toBe(false);
    expect(isLockedByPrefill(component, 'digitalnologin')).toBe(false);
    expect(isLockedByPrefill(component, undefined)).toBe(false);
    expect(isLockedByPrefill(createComponent({}), 'digital')).toBe(false);
    expect(withPrefillLock(component, 'paper')).toBe(component);
  });
});

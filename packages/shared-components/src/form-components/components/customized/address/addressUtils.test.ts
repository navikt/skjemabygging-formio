import { Address } from '@navikt/skjemadigitalisering-shared-domain';
import { addressToString } from './addressUtils';

describe('addressToString', () => {
  it('formats a full address', () => {
    const address: Address = {
      co: 'John Doe',
      adresse: 'Main St 1',
      bygning: 'Building A',
      postboks: '123',
      postnummer: '0123',
      bySted: 'Oslo',
      region: 'Oslo',
      land: { value: 'no', label: 'Norway' },
    } as Address;
    expect(addressToString(address)).toBe('c/o John Doe, Main St 1, Building A, 123, 0123 Oslo, Oslo, Norway');
  });

  it('handles missing fields gracefully', () => {
    const address: Address = {
      adresse: 'Main St 1',
      postnummer: '0123',
      land: { value: 'no', label: 'Norway' },
    } as Address;
    expect(addressToString(address)).toBe('Main St 1, 0123, Norway');
  });

  it('returns empty string for empty address', () => {
    expect(addressToString({} as Address)).toBe('');
  });

  it('formats address with only bySted', () => {
    const address: Address = {
      bySted: 'Oslo',
    } as Address;
    expect(addressToString(address)).toBe('Oslo');
  });
});

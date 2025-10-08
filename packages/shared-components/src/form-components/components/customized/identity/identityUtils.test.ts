import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { getIdentityLabel, getIdentityValue } from './identityUtils';

describe('identityUtils', () => {
  const mockIdentitetsnummer = '12345678901';
  const mockFodselsdato = '1990-01-01';

  it('getIdentityLabel returns identityNumber label when identitetsnummer exists', () => {
    const value = { identitetsnummer: mockIdentitetsnummer };
    expect(getIdentityLabel(value)).toBe(TEXTS.statiske.identity.identityNumber);
  });

  it('getIdentityLabel returns yourBirthdate label when identitetsnummer is missing', () => {
    const value = { fodselsdato: mockFodselsdato };
    expect(getIdentityLabel(value)).toBe(TEXTS.statiske.identity.yourBirthdate);
  });

  it('getIdentityValue formats identitetsnummer when present', () => {
    const value = { identitetsnummer: mockIdentitetsnummer };
    expect(getIdentityValue(value)).toBe('123456 78901');
  });

  it('getIdentityValue formats fodselsdato when identitetsnummer is missing', () => {
    const value = { fodselsdato: mockFodselsdato };
    expect(getIdentityValue(value)).toBe('01.01.1990');
  });
});

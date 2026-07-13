import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { validateValue } from './validators';

describe('validateValue', () => {
  it('returns required violation for empty value', () => {
    expect(validateValue('', 'Name', { required: true })).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Name' },
    });
  });

  it('passes required when value is present', () => {
    expect(validateValue('John', 'Name', { required: true })).toBeUndefined();
  });

  it('flags too short values', () => {
    expect(validateValue('ab', 'Name', { minLength: 3 })).toEqual({
      textKey: TEXTS.validering.minLength,
      params: { field: 'Name', length: 3 },
    });
  });

  it('flags too long values', () => {
    expect(validateValue('abcd', 'Name', { maxLength: 3 })).toEqual({
      textKey: TEXTS.validering.maxLength,
      params: { field: 'Name', length: 3 },
    });
  });

  it('returns undefined when no rules violated', () => {
    expect(validateValue('abc', 'Name', { required: true, minLength: 2, maxLength: 5 })).toBeUndefined();
  });

  it('validates raw and submission date values', () => {
    expect(validateValue('31.12.2024', 'Date', { date: true })).toBeUndefined();
    expect(validateValue('2024-12-31', 'Date', { date: true })).toBeUndefined();
    expect(validateValue('31.13.2024', 'Date', { date: true })).toEqual({
      textKey: 'invalid_date',
      params: { field: 'Date' },
    });
  });

  it('validates date min and max boundaries', () => {
    expect(validateValue('2023-12-31', 'Date', { date: true, fromDate: '2024-01-01' })).toEqual({
      textKey: 'minDate',
      params: { field: 'Date', minDate: '01.01.2024' },
    });

    expect(validateValue('2025-01-01', 'Date', { date: true, toDate: '2024-12-31' })).toEqual({
      textKey: 'maxDate',
      params: { field: 'Date', maxDate: '31.12.2024' },
    });
  });

  it('validates month values with locale-aware parsing', () => {
    expect(validateValue('mars 2024', 'Month', { month: true }, 'nb')).toBeUndefined();
    expect(validateValue('March 2024', 'Month', { month: true }, 'en')).toBeUndefined();
    expect(validateValue('2024-03', 'Month', { month: true }, 'nb')).toBeUndefined();
    expect(validateValue('2024-13', 'Month', { month: true }, 'nb')).toEqual({
      textKey: 'invalid_date',
      params: { field: 'Month' },
    });
  });

  it('validates month year boundaries', () => {
    expect(validateValue('2019-12', 'Month', { month: true, monthMinYear: 2020 })).toEqual({
      textKey: TEXTS.validering.minYear,
      params: { field: 'Month', minYear: 2020 },
    });

    expect(validateValue('2026-01', 'Month', { month: true, monthMaxYear: 2025 })).toEqual({
      textKey: TEXTS.validering.maxYear,
      params: { field: 'Month', maxYear: 2025 },
    });
  });

  it('validates organization number values', () => {
    expect(validateValue('889640782', 'Organization number', { organizationNumber: true })).toBeUndefined();
    expect(validateValue('889 640 782', 'Organization number', { organizationNumber: true })).toBeUndefined();
    expect(validateValue('123456789', 'Organization number', { organizationNumber: true })).toEqual({
      textKey: TEXTS.validering.orgNrCustomError,
      params: { field: 'Organization number' },
    });
  });

  it('validates national identity number values (fnr/dnr)', () => {
    expect(validateValue('13097248022', 'Fnr', { nationalIdentityNumber: true })).toBeUndefined();
    expect(validateValue('130972 48022', 'Fnr', { nationalIdentityNumber: true })).toBeUndefined();
    expect(validateValue('53097248016', 'Fnr', { nationalIdentityNumber: true })).toBeUndefined();
    expect(validateValue('13097248023', 'Fnr', { nationalIdentityNumber: true })).toEqual({
      textKey: TEXTS.validering.fodselsnummerDNummer,
      params: { field: 'Fnr' },
    });
  });

  it('rejects test-type identity numbers unless allowTestTypes is set', () => {
    const hnr = '13527248013';
    expect(validateValue(hnr, 'Fnr', { nationalIdentityNumber: true }, 'nb', { allowTestTypes: false })).toEqual({
      textKey: TEXTS.validering.fodselsnummerDNummer,
      params: { field: 'Fnr' },
    });
    expect(validateValue(hnr, 'Fnr', { nationalIdentityNumber: true }, 'nb', { allowTestTypes: true })).toBeUndefined();
  });

  it('validates norwegian postal code values', () => {
    expect(validateValue('0001', 'Postnummer', { postalCode: true })).toBeUndefined();
    expect(validateValue('001', 'Postnummer', { postalCode: true })).toEqual({
      textKey: TEXTS.validering.invalidPostalCode,
      params: { field: 'Postnummer' },
    });
    expect(validateValue('ABCD', 'Postnummer', { postalCode: true })).toEqual({
      textKey: TEXTS.validering.invalidPostalCode,
      params: { field: 'Postnummer' },
    });
  });

  it('validates account number values', () => {
    expect(validateValue('12345678903', 'Kontonummer', { accountNumber: true })).toBeUndefined();
    expect(validateValue('1234 56 78903', 'Kontonummer', { accountNumber: true })).toBeUndefined();
    expect(validateValue('12345678901', 'Kontonummer', { accountNumber: true })).toEqual({
      textKey: TEXTS.validering.accountNumberCustomError,
      params: { field: 'Kontonummer' },
    });
  });

  it('validates iban values', () => {
    expect(validateValue('NO9386011117947', 'IBAN', { iban: true })).toBeUndefined();
    expect(validateValue('NO93 8601 1117 947', 'IBAN', { iban: true })).toBeUndefined();
    expect(validateValue('NO938601111794', 'IBAN', { iban: true })).toEqual({
      textKey: TEXTS.validering.wrongBBANLength,
      params: { field: 'IBAN' },
    });
  });

  it('requires at least one selected dataFetcher option', () => {
    expect(
      validateValue({ aktivitet1: false, aktivitet2: false }, 'Aktivitetsvelger', {
        required: true,
        dataFetcherSelection: true,
      }),
    ).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Aktivitetsvelger' },
    });

    expect(
      validateValue({ aktivitet1: true, aktivitet2: false }, 'Aktivitetsvelger', {
        required: true,
        dataFetcherSelection: true,
      }),
    ).toBeUndefined();
  });

  it('validates norwegian phone numbers with area code', () => {
    expect(
      validateValue('12345678', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, areaCode: '+47' },
      }),
    ).toBeUndefined();
    expect(
      validateValue('12ab5678', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, areaCode: '+47' },
      }),
    ).toEqual({
      textKey: TEXTS.validering.digitsOnly,
      params: { field: 'Telefonnummer' },
    });
    expect(
      validateValue('1234567', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, areaCode: '+47' },
      }),
    ).toEqual({
      textKey: TEXTS.validering.phoneNumberLength,
      params: { field: 'Telefonnummer' },
    });
  });

  it('validates free-form phone numbers without area code', () => {
    expect(validateValue('+49 1234-5678', 'Telefonnummer', { phoneNumber: { showAreaCode: false } })).toBeUndefined();
    expect(validateValue('abc', 'Telefonnummer', { phoneNumber: { showAreaCode: false } })).toEqual({
      textKey: TEXTS.validering.digitsOnly,
      params: { field: 'Telefonnummer' },
    });
  });
});

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { validateValue } from './validators';

describe('validateValue', () => {
  it('returns required violation for empty value', () => {
    expect(validateValue('', 'Name', { required: true })).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Name' },
    });
  });

  it('returns required violation for an unchecked boolean', () => {
    expect(validateValue(false, 'Declaration', { required: true })).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Declaration' },
    });
  });

  it('passes required when value is present', () => {
    expect(validateValue('John', 'Name', { required: true })).toBeUndefined();
  });

  it('requires a select value that is still available', () => {
    expect(
      validateValue({ value: 'removed', label: 'Removed option' }, 'Delivery', {
        onlyAvailableItems: ['current'],
      }),
    ).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Delivery' },
    });
    expect(
      validateValue({ value: 'current', label: 'Current option' }, 'Delivery', {
        onlyAvailableItems: ['current'],
      }),
    ).toBeUndefined();
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
      textKey: 'minYear',
      params: { field: 'Month', minYear: 2020 },
    });

    expect(validateValue('2026-01', 'Month', { month: true, monthMaxYear: 2025 })).toEqual({
      textKey: 'maxYear',
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
      textKey: 'fodselsnummerDNummer',
      params: { field: 'Fnr' },
    });
  });

  it('rejects test-type identity numbers unless allowTestTypes is set', () => {
    const hnr = '13527248013';
    expect(validateValue(hnr, 'Fnr', { nationalIdentityNumber: true }, 'nb', { allowTestTypes: false })).toEqual({
      textKey: 'fodselsnummerDNummer',
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

  it('validates driving list parking expenses', () => {
    expect(
      validateValue('abc', 'Parkeringsutgifter', {
        drivingListParkingExpense: { date: '2024-01-12' },
      }),
    ).toEqual({
      textKey: TEXTS.validering.validParkingExpenses,
      params: { dato: '12.01.2024' },
    });

    expect(
      validateValue('101', 'Parkeringsutgifter', {
        drivingListParkingExpense: { date: '2024-01-12', enforceMaxHundred: true },
      }),
    ).toEqual({
      textKey: TEXTS.validering.parkingExpensesAboveHundred,
      params: {},
    });

    expect(
      validateValue('100', 'Parkeringsutgifter', {
        drivingListParkingExpense: { date: '2024-01-12', enforceMaxHundred: true },
      }),
    ).toBeUndefined();
  });

  it('validates norwegian phone numbers on the selected calling code', () => {
    expect(
      validateValue('12345678', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, countryCallingCode: '+47' },
      }),
    ).toBeUndefined();
    expect(
      validateValue('12ab5678', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, countryCallingCode: '+47' },
      }),
    ).toEqual({
      textKey: TEXTS.validering.digitsOnly,
      params: { field: 'Telefonnummer' },
    });
    expect(
      validateValue('1234567', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, countryCallingCode: '+47' },
      }),
    ).toEqual({
      textKey: TEXTS.validering.phoneNumberLength,
      params: { field: 'Telefonnummer' },
    });
  });

  it('only holds a number to eight digits when the selected calling code is norwegian', () => {
    expect(
      validateValue('1234567', 'Telefonnummer', {
        phoneNumber: { showAreaCode: true, countryCallingCode: '+46' },
      }),
    ).toBeUndefined();
    // No calling code has been selected yet, so nothing but the free-form rules apply.
    expect(validateValue('1234567', 'Telefonnummer', { phoneNumber: { showAreaCode: true } })).toBeUndefined();
  });

  it('validates free-form phone numbers without area code', () => {
    expect(validateValue('+49 1234-5678', 'Telefonnummer', { phoneNumber: { showAreaCode: false } })).toBeUndefined();
    expect(validateValue('abc', 'Telefonnummer', { phoneNumber: { showAreaCode: false } })).toEqual({
      textKey: TEXTS.validering.digitsOnly,
      params: { field: 'Telefonnummer' },
    });
  });

  it('validates an authored pattern with the message that belongs to it', () => {
    const expression = '([01]\\d|2[0-3]):[0-5]\\d';

    expect(validateValue('12:30', 'Klokkeslett', { pattern: { expression } })).toBeUndefined();
    expect(
      validateValue('kl 7', 'Klokkeslett', { pattern: { expression, message: 'Skriv klokkeslett som HH:mm' } }),
    ).toEqual({
      textKey: 'Skriv klokkeslett som HH:mm',
      params: { field: 'Klokkeslett', pattern: expression },
    });
  });

  it('falls back to the generic pattern message', () => {
    expect(validateValue('kl 7', 'Klokkeslett', { pattern: { expression: '\\d{2}:\\d{2}' } })).toEqual({
      textKey: TEXTS.validering.pattern,
      params: { field: 'Klokkeslett', pattern: '\\d{2}:\\d{2}' },
    });
  });

  it('anchors the pattern, so a partial match is not enough', () => {
    expect(validateValue('kl 12:30', 'Klokkeslett', { pattern: { expression: '([01]\\d|2[0-3]):[0-5]\\d' } })).toEqual({
      textKey: TEXTS.validering.pattern,
      params: { field: 'Klokkeslett', pattern: '([01]\\d|2[0-3]):[0-5]\\d' },
    });
  });

  it('requires at least one uploaded file', () => {
    expect(validateValue([], 'Dokumentasjon', { requiredFiles: true })).toEqual({
      textKey: TEXTS.validering.fileMissing,
      params: { field: 'Dokumentasjon' },
    });
    expect(validateValue([{ id: '1' }], 'Dokumentasjon', { requiredFiles: true })).toBeUndefined();
  });

  describe('a value the field must differ from', () => {
    const message = 'Underenhet kan ikke være det samme som organisasjonsnummer.';

    it('reports the authored message when the values are equal', () => {
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: '974652269', message, comparison: 'strict' },
        }),
      ).toEqual({ textKey: message, params: { field: 'Underenhet' } });
    });

    it('passes when the values differ', () => {
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: '910753751', message, comparison: 'strict' },
        }),
      ).toBeUndefined();
    });

    it('compares strictly, so a number never equals the text that was typed', () => {
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: 974652269, message, comparison: 'strict' },
        }),
      ).toBeUndefined();
    });

    it('coerces only the entered value in a string comparison, the way the expression did', () => {
      expect(
        validateValue(974652269, 'Underenhet', {
          notEqual: { value: '974652269', message, comparison: 'string' },
        }),
      ).toEqual({ textKey: message, params: { field: 'Underenhet' } });
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: 974652269, message, comparison: 'string' },
        }),
      ).toBeUndefined();
    });

    it('passes when the other field is unanswered', () => {
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: undefined, message, comparison: 'string' },
        }),
      ).toBeUndefined();
      expect(
        validateValue('974652269', 'Underenhet', {
          notEqual: { value: undefined, message, comparison: 'strict' },
        }),
      ).toBeUndefined();
    });

    it('is not reached for an empty value, which the required rule answers for', () => {
      expect(
        validateValue('', 'Underenhet', {
          required: true,
          notEqual: { value: '', message, comparison: 'strict' },
        }),
      ).toEqual({ textKey: TEXTS.validering.required, params: { field: 'Underenhet' } });
    });

    it('reports the format of the value before comparing it to another field', () => {
      expect(
        validateValue('123', 'Underenhet', {
          organizationNumber: true,
          notEqual: { value: '123', message, comparison: 'string' },
        }),
      ).toEqual({ textKey: TEXTS.validering.orgNrCustomError, params: { field: 'Underenhet' } });
    });
  });

  describe('authored messages for date bounds', () => {
    const dateMessages = {
      fromDate: 'Til dato må være større enn Fra dato',
      toDate: 'Perioden kan være maksimalt ett år',
    };
    const rules = { date: true, fromDate: '2024-01-11', toDate: '2025-01-09', dateMessages };

    it('replaces the standard minimum date message', () => {
      expect(validateValue('2024-01-10', 'Til dato', rules)).toEqual({
        textKey: dateMessages.fromDate,
        params: { field: 'Til dato', minDate: '11.01.2024' },
      });
    });

    it('replaces the standard maximum date message', () => {
      expect(validateValue('2025-01-10', 'Til dato', rules)).toEqual({
        textKey: dateMessages.toDate,
        params: { field: 'Til dato', maxDate: '09.01.2025' },
      });
    });

    it('accepts both ends of the allowed period', () => {
      expect(validateValue('2024-01-11', 'Til dato', rules)).toBeUndefined();
      expect(validateValue('2025-01-09', 'Til dato', rules)).toBeUndefined();
    });

    it('keeps the standard messages when none were authored', () => {
      expect(validateValue('2024-01-10', 'Til dato', { date: true, fromDate: '2024-01-11' })).toEqual({
        textKey: 'minDate',
        params: { field: 'Til dato', minDate: '11.01.2024' },
      });
    });
  });
});

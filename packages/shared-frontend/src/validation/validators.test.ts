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
});

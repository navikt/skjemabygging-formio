import { DataFetcherElement } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getSelectedValuesAsList, getSelectedValuesMap, hasSelectedValue } from './dataFetcherUtils';

describe('dataFetcherUtils', () => {
  const values: DataFetcherElement[] = [
    { value: 'a1', label: 'Aktivitet 1' },
    { value: 'a2', label: 'Aktivitet 2' },
  ];

  it('maps selected values to checkbox submission shape', () => {
    expect(getSelectedValuesMap(values, ['a2'])).toEqual({
      a1: false,
      a2: true,
    });
  });

  it('extracts selected values from checkbox submission shape', () => {
    expect(getSelectedValuesAsList({ a1: true, a2: false })).toEqual(['a1']);
  });

  it('detects whether a data fetcher value has any checked option', () => {
    expect(hasSelectedValue(undefined)).toBe(false);
    expect(hasSelectedValue({ a1: false, a2: false })).toBe(false);
    expect(hasSelectedValue({ a1: true, a2: false })).toBe(true);
  });
});

import { DataFetcherElement } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getSelectedValuesAsList, getSelectedValuesMap, toSelectedValuesList } from './dataFetcherUtils';

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

  it('lists the checked options of a stored value map', () => {
    expect(toSelectedValuesList(undefined)).toEqual([]);
    expect(toSelectedValuesList('ikke et kart')).toEqual([]);
    expect(toSelectedValuesList({ a1: false, a2: false })).toEqual([]);
    expect(toSelectedValuesList({ a1: true, a2: false })).toEqual(['a1']);
  });
});

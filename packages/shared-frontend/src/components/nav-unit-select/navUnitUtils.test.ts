import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { filterNavUnits, resolveNavUnits, sortNavUnits } from './navUnitUtils';

const units = [
  { enhetNr: '2', navn: 'NAV Ytelse', type: 'YTA' },
  { enhetNr: '1', navn: 'NAV Arbeid', type: 'ALS' },
] as Enhet[];

describe('filterNavUnits', () => {
  it('filters units by type and sorts the result by name', () => {
    expect(filterNavUnits(units, ['ALS'])).toEqual([units[1]]);
  });

  it('keeps all units when no types are selected', () => {
    expect(filterNavUnits(units)).toEqual([units[1], units[0]]);
  });
});

describe('sortNavUnits', () => {
  it('does not mutate the fetched unit list', () => {
    sortNavUnits(units);

    expect(units).toEqual([
      { enhetNr: '2', navn: 'NAV Ytelse', type: 'YTA' },
      { enhetNr: '1', navn: 'NAV Arbeid', type: 'ALS' },
    ]);
  });

  describe('resolveNavUnits', () => {
    it('uses every configured unit type', () => {
      expect(resolveNavUnits(units, ['ALS', 'YTA'])).toEqual([units[1], units[0]]);
    });

    it('falls back to all successful units when the filter has no matches', () => {
      expect(resolveNavUnits(units, ['HMS'])).toEqual([units[1], units[0]]);
    });

    it.each([undefined, []])('uses all units for unspecified or empty types: %s', (types) => {
      expect(resolveNavUnits(units, types)).toEqual([units[1], units[0]]);
    });

    it('keeps an empty successful result empty', () => {
      expect(resolveNavUnits([], ['ALS'])).toEqual([]);
    });
  });
});

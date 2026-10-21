import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { filterNavUnits, sortNavUnits } from './navUnitUtils';

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
});

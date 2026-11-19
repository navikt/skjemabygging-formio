import { Enhet, Enhetstype } from '../../models';

type NavUnit = Pick<Enhet, 'navn' | 'type'>;

const sortNavUnits = <T extends NavUnit>(units: T[]) =>
  [...units].sort((unitA, unitB) => unitA.navn.localeCompare(unitB.navn, 'nb'));

const filterNavUnits = <T extends NavUnit>(units: T[], unitTypes?: Enhetstype[]) =>
  sortNavUnits(units.filter((unit) => !unitTypes?.length || unitTypes.includes(unit.type)));

const resolveNavUnits = <T extends NavUnit>(units: T[], unitTypes?: Enhetstype[]) => {
  const filtered = filterNavUnits(units, unitTypes);
  return filtered.length ? filtered : sortNavUnits(units);
};

const navUnitUtils = { filterNavUnits, resolveNavUnits, sortNavUnits };

export { navUnitUtils };

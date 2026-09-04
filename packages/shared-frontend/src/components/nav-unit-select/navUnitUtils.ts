import { Enhet, Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';

const sortNavUnits = (units: Enhet[]) => [...units].sort((unitA, unitB) => unitA.navn.localeCompare(unitB.navn, 'nb'));

const filterNavUnits = (units: Enhet[], unitTypes?: Enhetstype[]) =>
  sortNavUnits(units.filter((unit) => !unitTypes?.length || unitTypes.includes(unit.type)));

export { filterNavUnits, sortNavUnits };

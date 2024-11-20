import { SortState } from '@navikt/ds-react';

type SortDirection = SortState['direction'];

const getLocaleComparator = (property?: string, direction?: SortDirection) => (a, b) => {
  if (!property || !direction) {
    return 1;
  }
  const valueA = `${a[property] ?? ''}`.trim();
  const valueB = `${b[property] ?? ''}`.trim();

  if (direction === 'ascending') {
    return valueA.localeCompare(valueB, 'nb-NO');
  }
  return valueB.localeCompare(valueA, 'nb-NO');
};

const listSort = { getLocaleComparator };
export default listSort;

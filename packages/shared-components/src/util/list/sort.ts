import { SortState } from '@navikt/ds-react';
import htmlUtils from '../html/htmlUtils';

type SortDirection = SortState['direction'];

const normalizeString = (value: string | undefined) => {
  const textValue = `${value ?? ''}`;

  if (htmlUtils.isHtmlString(textValue)) {
    return htmlUtils.extractTextContent(textValue).trim();
  }
  return textValue.trim();
};

const getLocaleComparator =
  (property?: string, direction?: SortDirection, reverseDefault: boolean = false) =>
  (a, b) => {
    if (!property || !direction) {
      return reverseDefault ? -1 : 1;
    }
    const valueA = normalizeString(a[property]);
    const valueB = normalizeString(b[property]);

    if (direction === 'ascending') {
      return valueA.localeCompare(valueB, 'nb-NO');
    }
    return valueB.localeCompare(valueA, 'nb-NO');
  };

const listSort = { getLocaleComparator };
export default listSort;

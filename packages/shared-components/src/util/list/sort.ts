import { SortState } from '@navikt/ds-react';
import { htmlUtils } from '@navikt/skjemadigitalisering-shared-domain';
import htmlTranslationUtils from '../html/htmlTranslationUtils';

type SortDirection = SortState['direction'];

const normalizeString = (value: string | undefined) => {
  const textValue = `${value ?? ''}`;

  if (htmlUtils.isHtmlString(textValue)) {
    return htmlTranslationUtils.extractTextContent(textValue).trim();
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

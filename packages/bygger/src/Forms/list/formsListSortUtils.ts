import { SortState } from '@navikt/ds-react';
import { Status } from '../status/types';
import { FormListType } from './FormsList';

type SortDirection = 'ascending' | 'descending' | 'none';

const sortFormsByProperty = (forms: FormListType[], sortingKey: string, sortingOrder?: SortDirection) => {
  return forms.sort((a, b) => {
    const valueA = a[sortingKey] || '';
    const valueB = b[sortingKey] || '';

    if (sortingOrder === 'ascending') {
      return valueA < valueB ? -1 : 1;
    } else if (sortingOrder === 'descending') {
      return valueA < valueB ? 1 : -1;
    }
    return 0;
  });
};

const sortByFormNumber = (forms: FormListType[], sortDirection?: SortDirection) => {
  const matchesNavSkjemanummer = (formMetaData: FormListType) => {
    return formMetaData.number.match(/^(NAV)\s\d\d-\d\d.\d\d/);
  };

  if (sortDirection === 'ascending') {
    return [
      ...sortFormsByProperty(forms.filter(matchesNavSkjemanummer), 'number', 'ascending'),
      ...sortFormsByProperty(
        forms.filter((data) => !matchesNavSkjemanummer(data)),
        'number',
        'ascending',
      ),
    ];
  }

  if (sortDirection === 'descending') {
    return [
      ...sortFormsByProperty(
        forms.filter((data) => !matchesNavSkjemanummer(data)),
        'number',
        'descending',
      ),
      ...sortFormsByProperty(forms.filter(matchesNavSkjemanummer), 'number', 'descending'),
    ];
  }
  return forms;
};

const sortByStatus = (forms: FormListType[], sortOrder?: SortDirection) => {
  const statusOrder: Record<Status, number> = {
    UNKNOWN: 99,
    PUBLISHED: 1,
    PENDING: 2,
    DRAFT: 3,
    UNPUBLISHED: 4,
    TESTFORM: 5,
  };

  const compareStatus = (thisStatus, thatStatus) => {
    if (thisStatus === thatStatus) return 0;
    if (thisStatus === 'UNKNOWN') return 1;
    if (thatStatus === 'UNKNOWN') return -1;
    if (sortOrder === 'ascending') return statusOrder[thisStatus] - statusOrder[thatStatus];
    if (sortOrder === 'descending') return statusOrder[thatStatus] - statusOrder[thisStatus];
    return 0;
  };

  return forms.sort((a, b) => compareStatus(a.status, b.status));
};

const sortedForms = (forms: FormListType[], sort: SortState) => {
  switch (sort.orderBy) {
    case 'number':
      return sortByFormNumber(forms, sort.direction);
    case 'status':
      return sortByStatus(forms, sort.direction);
    default:
      return sortFormsByProperty(forms, sort.orderBy, sort.direction);
  }
};

export default sortedForms;

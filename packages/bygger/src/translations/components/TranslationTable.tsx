import { SortState, Table } from '@navikt/ds-react';
import { listSort, SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import NewTranslationRow from './NewTranslationRow';
import TranslationRow from './TranslationRow';
import useTranslationTableStyles from './styles';

const columns = [
  { key: 'nb', label: 'Bokmål' },
  { key: 'nn', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

interface Props {
  rows: FormsApiTranslation[] | undefined;
  loading?: boolean;
  addNewRow?: boolean;
}

const TranslationTable = ({ rows, loading = false, addNewRow = false }: Props) => {
  const [sortState, setSortState] = useState<SortState>();
  const styles = useTranslationTableStyles();

  const handleSort = (sortKey: string) => {
    setSortState((currentState) => {
      if (!currentState || sortKey !== currentState.orderBy) {
        return { orderBy: sortKey, direction: 'ascending' };
      } else {
        return currentState.direction === 'ascending' ? { orderBy: sortKey, direction: 'descending' } : undefined;
      }
    });
  };

  const sortedRows = useMemo<FormsApiTranslation[] | undefined>(() => {
    return rows?.slice().sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction, addNewRow));
  }, [rows, sortState?.orderBy, sortState?.direction, addNewRow]);

  if (loading || !sortedRows) {
    return <SkeletonList size={10} height={60} />;
  }

  return (
    <Table sort={sortState} onSortChange={handleSort}>
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeader sortable sortKey={column.key} className={styles.column} key={column.key} scope="col">
              {column.label}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {addNewRow && <NewTranslationRow />}
        {sortedRows.map((row) => (
          <TranslationRow key={row.key} translation={row} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default TranslationTable;

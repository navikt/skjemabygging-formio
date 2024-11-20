import { SortState, Table } from '@navikt/ds-react';
import { listSort, SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import TranslationRow from './TranslationRow';
import useTranslationTableStyles from './styles';

const columns = [
  { key: 'nb', label: 'Bokmål' },
  { key: 'nn', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

const TranslationTable = () => {
  const [sortState, setSortState] = useState<SortState>();
  const { tag } = useParams();
  const { translationsPerTag } = useGlobalTranslations();
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

  const sortedTranslationRows = useMemo(() => {
    if (!tag || !translationsPerTag) {
      return undefined;
    }
    return translationsPerTag[tag].slice().sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction));
  }, [sortState, tag, translationsPerTag]);

  if (sortedTranslationRows === undefined) {
    return <SkeletonList size={20} />;
  }

  return (
    <Table zebraStripes sort={sortState} onSortChange={handleSort}>
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
        {sortedTranslationRows.map((row) => (
          <TranslationRow key={row.key} translation={row} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default TranslationTable;

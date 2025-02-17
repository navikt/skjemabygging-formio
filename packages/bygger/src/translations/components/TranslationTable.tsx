import { SortState, Table } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode } from 'react';
import useTranslationTableStyles from './styles';

const columns = [
  { key: 'nb', label: 'Bokmål' },
  { key: 'nn', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

interface Props {
  sort: SortState | undefined;
  onSortChange: (sortkey: string) => void;
  loading?: boolean;
  children?: ReactNode[];
}

const TranslationTable = ({ sort, onSortChange, loading = false, children }: Props) => {
  const styles = useTranslationTableStyles();

  if (loading) {
    return <SkeletonList size={10} height={60} />;
  }

  return (
    <Table className={styles.table} sort={sort} onSortChange={onSortChange}>
      <Table.Header className={styles.header}>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeader sortable sortKey={column.key} className={styles.column} key={column.key} scope="col">
              {column.label}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table>
  );
};

export default TranslationTable;

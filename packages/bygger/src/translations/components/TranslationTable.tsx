import { SortState, Table } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode } from 'react';
import useTranslationTableStyles from './styles';

const defaultColumns = [
  { key: 'nb', label: 'Bokmål' },
  { key: 'nn', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

interface Props {
  columns?: { key: string; label: string }[];
  actionColumn?: { key: string; label: string };
  sort?: SortState;
  onSortChange?: (sortkey: string) => void;
  loading?: boolean;
  children?: ReactNode[];
}

const TranslationTable = ({
  columns = defaultColumns,
  actionColumn,
  sort,
  onSortChange,
  loading = false,
  children,
}: Props) => {
  const styles = useTranslationTableStyles();

  if (loading) {
    return <SkeletonList size={10} height={60} />;
  }

  return (
    <Table className={styles.table} sort={sort} onSortChange={onSortChange}>
      <Table.Header className={styles.header}>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeader
              sortable={!!onSortChange}
              sortKey={column.key}
              className={styles.column}
              key={column.key}
              scope="col"
            >
              {column.label}
            </Table.ColumnHeader>
          ))}
          {actionColumn && (
            <Table.ColumnHeader className={styles.actionColumn} key={actionColumn.key} scope="col">
              {actionColumn.label}
            </Table.ColumnHeader>
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table>
  );
};

export default TranslationTable;

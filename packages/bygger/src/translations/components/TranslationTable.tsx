import { SortState, Table } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import NewTranslationRow from './NewTranslationRow';
import TranslationRow from './TranslationRow';
import useTranslationTableStyles from './styles';

const columns = [
  { key: 'nb', label: 'Bokmål' },
  { key: 'nn', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

interface Props {
  rows?: FormsApiGlobalTranslation[];
  sortState?: SortState;
  handleSort: (sortKey: string) => void;
  addNewRow: boolean;
}

const TranslationTable = ({ rows, sortState, handleSort, addNewRow }: Props) => {
  const styles = useTranslationTableStyles();

  if (!rows) {
    return <SkeletonList size={20} />;
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
        {rows.map((row) => (
          <TranslationRow key={row.key} translation={row} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default TranslationTable;

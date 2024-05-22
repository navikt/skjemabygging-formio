import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { SortState, Table } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormStatus from '../status/FormStatus';
import { Status } from '../status/types';
import sortedForms from './formsListSortUtils';

const useStyles = makeStyles({
  table: {
    tableLayout: 'fixed',
  },
  idColumn: {
    width: '9rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
  },
  titleColumn: {
    paddingRight: '1rem',
  },
  modifiedColumn: {
    width: '6rem',
  },
  statusColumn: {
    width: '6rem',
    textAlign: 'center',
  },
  clickableRow: {
    cursor: 'pointer',
  },
  padlockIcon: {
    color: 'black',
    position: 'relative',
    top: '0.2rem',
    left: '0.4rem',
  },
});

export interface FormListType {
  id: string;
  modified: string;
  title: string;
  path: string;
  number: string;
  status: Status;
  locked: boolean;
}

interface FormsListPageProps {
  forms: FormListType[];
}

const FormsList = ({ forms }: FormsListPageProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortState>({
    orderBy: 'modified',
    direction: 'descending',
  });

  const handleSort = (sortKey?: string) => {
    if (!sortKey) return;

    setSort({
      orderBy: sortKey,
      direction: sortKey === sort.orderBy && sort.direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  return (
    <nav>
      <Table size="medium" className={styles.table} sort={sort} onSortChange={(sortKey) => handleSort(sortKey)}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader scope="col" className={styles.idColumn} sortable sortKey="number">
              Skjemanr.
            </Table.ColumnHeader>
            <Table.ColumnHeader scope="col" className={styles.titleColumn} sortable sortKey="title">
              Skjematittel
            </Table.ColumnHeader>
            <Table.ColumnHeader scope="col" className={styles.modifiedColumn} sortable sortKey="modified">
              Endret
            </Table.ColumnHeader>
            <Table.ColumnHeader scope="col" className={styles.statusColumn} sortable sortKey="status">
              Status
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedForms(forms, sort).map((form) => {
            return (
              <Table.Row key={form.id} onClick={() => navigate(form.path)} className={styles.clickableRow}>
                <Table.DataCell className={styles.idColumn}>
                  <Link to={form.path} className="sr-only">
                    {form.number}
                  </Link>
                  <span className="aria-hidden">{form.number}</span>
                </Table.DataCell>
                <Table.DataCell className={styles.titleColumn}>
                  {form.title}
                  {form.locked && <PadlockLockedIcon title="Skjemaet er låst" className={styles.padlockIcon} />}
                </Table.DataCell>
                <Table.DataCell className={styles.modifiedColumn}>
                  {dateUtils.toLocaleDate(form.modified)}
                </Table.DataCell>
                <Table.DataCell className={styles.statusColumn}>
                  <FormStatus status={form.status} size="small" iconOnly={true} />
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </nav>
  );
};

export { FormsList };

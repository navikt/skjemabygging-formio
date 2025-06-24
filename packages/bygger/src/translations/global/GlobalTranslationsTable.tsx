import { SortState, Switch } from '@navikt/ds-react';
import { listSort } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';
import NewTranslationRow from '../components/NewTranslationRow';
import TranslationRow from '../components/TranslationRow';
import TranslationTable from '../components/TranslationTable';
import { useStickyStyles } from '../components/styles';

interface Props {
  translations: FormsApiTranslation[] | undefined;
  isKeyBased: boolean;
  addNewRow: boolean;
  loading?: boolean;
}

const GlobalTranslationsTable = ({ translations, addNewRow, isKeyBased = false, loading = false }: Props) => {
  const [isFilterChecked, setIsFilterChecked] = useState(false);
  const [sortState, setSortState] = useState<SortState>();
  const { updateTranslation, errors, editState } = useEditGlobalTranslations();
  const stickyStyles = useStickyStyles();

  const handleSort = (sortKey: string) => {
    setSortState((currentState) => {
      if (!currentState || sortKey !== currentState.orderBy) {
        return { orderBy: sortKey, direction: 'ascending' };
      } else {
        return currentState.direction === 'ascending' ? { orderBy: sortKey, direction: 'descending' } : undefined;
      }
    });
  };

  const filteredRows = useMemo<FormsApiTranslation[] | undefined>(() => {
    return isFilterChecked ? translations?.filter((row) => !row.nn || !row.en) : translations;
  }, [isFilterChecked, translations]);

  const sortedRows = useMemo<FormsApiTranslation[] | undefined>(() => {
    return filteredRows
      ?.slice()
      .sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction, addNewRow));
  }, [filteredRows, sortState?.orderBy, sortState?.direction, addNewRow]);

  return (
    <>
      <div className={stickyStyles.filterRow}>
        <Switch checked={isFilterChecked} onChange={(event) => setIsFilterChecked(event.target.checked)}>
          Vis kun manglende oversettelser
        </Switch>
      </div>
      <TranslationTable
        loading={loading || !sortedRows}
        sort={sortState}
        onSortChange={handleSort}
        stickyHeaderClassname={stickyStyles.mainTable}
      >
        {addNewRow && <NewTranslationRow />}
        {sortedRows?.map((row) => (
          <TranslationRow
            key={row.key}
            translation={row}
            updateTranslation={updateTranslation}
            errors={errors}
            isKeyBased={isKeyBased}
            editState={editState}
          />
        ))}
      </TranslationTable>
    </>
  );
};

export default GlobalTranslationsTable;

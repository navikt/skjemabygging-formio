import { SortState, Switch } from '@navikt/ds-react';
import { listSort } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';
import NewTranslationRow from '../components/NewTranslationRow';
import TranslationRow from '../components/TranslationRow';
import TranslationTable from '../components/TranslationTable';

interface Props {
  translations: FormsApiGlobalTranslation[] | undefined;
  addNewRow: boolean;
  loading?: boolean;
}

const GlobalTranslationsTable = ({ translations, addNewRow, loading = false }: Props) => {
  const [isFilterChecked, setIsFilterChecked] = useState(false);
  const [sortState, setSortState] = useState<SortState>();
  const { updateTranslation, errors, editState } = useEditGlobalTranslations();

  const handleSort = (sortKey: string) => {
    setSortState((currentState) => {
      if (!currentState || sortKey !== currentState.orderBy) {
        return { orderBy: sortKey, direction: 'ascending' };
      } else {
        return currentState.direction === 'ascending' ? { orderBy: sortKey, direction: 'descending' } : undefined;
      }
    });
  };

  const filteredRows = useMemo<FormsApiGlobalTranslation[] | undefined>(() => {
    return isFilterChecked ? translations?.filter((row) => !row.nn || !row.en) : translations;
  }, [isFilterChecked, translations]);

  const sortedRows = useMemo<FormsApiGlobalTranslation[] | undefined>(() => {
    return filteredRows
      ?.slice()
      .sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction, addNewRow));
  }, [filteredRows, sortState?.orderBy, sortState?.direction, addNewRow]);

  return (
    <>
      <Switch checked={isFilterChecked} onChange={(event) => setIsFilterChecked(event.target.checked)}>
        Vis kun manglende oversettelser
      </Switch>
      <TranslationTable loading={loading || !sortedRows} sort={sortState} onSortChange={handleSort}>
        {addNewRow && <NewTranslationRow />}
        {sortedRows?.map((row) => (
          <TranslationRow
            key={row.key}
            translation={row}
            updateTranslation={updateTranslation}
            errors={errors}
            editState={editState}
          />
        ))}
      </TranslationTable>
    </>
  );
};

export default GlobalTranslationsTable;

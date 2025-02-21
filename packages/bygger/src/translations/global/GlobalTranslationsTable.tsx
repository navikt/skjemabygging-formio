import { SortState } from '@navikt/ds-react';
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

  const sortedRows = useMemo<FormsApiGlobalTranslation[] | undefined>(() => {
    return translations
      ?.slice()
      .sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction, addNewRow));
  }, [translations, sortState?.orderBy, sortState?.direction, addNewRow]);

  return (
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
  );
};

export default GlobalTranslationsTable;

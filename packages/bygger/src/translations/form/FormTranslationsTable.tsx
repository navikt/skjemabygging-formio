import { SortState } from '@navikt/ds-react';
import { listSort } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import TranslationRow from '../components/TranslationRow';
import TranslationTable from '../components/TranslationTable';

interface Props {
  translations: FormsApiFormTranslation[] | undefined;
  loading?: boolean;
}

const FormTranslationsTable = ({ translations, loading = false }: Props) => {
  const [sortState, setSortState] = useState<SortState>();
  const { updateTranslation, errors, editState } = useEditFormTranslations();

  const handleSort = (sortKey: string) => {
    setSortState((currentState) => {
      if (!currentState || sortKey !== currentState.orderBy) {
        return { orderBy: sortKey, direction: 'ascending' };
      } else {
        return currentState.direction === 'ascending' ? { orderBy: sortKey, direction: 'descending' } : undefined;
      }
    });
  };

  const sortedRows = useMemo<FormsApiFormTranslation[] | undefined>(() => {
    return translations?.slice().sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction));
  }, [translations, sortState?.orderBy, sortState?.direction]);

  return (
    <TranslationTable loading={loading || !sortedRows} sort={sortState} onSortChange={handleSort}>
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

export default FormTranslationsTable;

import { SortState, Switch } from '@navikt/ds-react';
import { listSort } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import TranslationRow from '../components/TranslationRow';
import TranslationTable from '../components/TranslationTable';
import { useStickyStyles } from '../components/styles';

interface Props {
  translations: FormsApiFormTranslation[] | undefined;
  loading?: boolean;
}

const FormTranslationsTable = ({ translations, loading = false }: Props) => {
  const [isFilterChecked, setIsFilterChecked] = useState(false);
  const [sortState, setSortState] = useState<SortState>();
  const { updateTranslation, errors, editState } = useEditFormTranslations();
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

  const filteredRows = useMemo<FormsApiFormTranslation[] | undefined>(() => {
    return isFilterChecked ? translations?.filter((row) => !row.nn || !row.en) : translations;
  }, [isFilterChecked, translations]);

  const sortedRows = useMemo<FormsApiFormTranslation[] | undefined>(() => {
    return filteredRows?.slice().sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction));
  }, [filteredRows, sortState?.orderBy, sortState?.direction]);

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

export default FormTranslationsTable;

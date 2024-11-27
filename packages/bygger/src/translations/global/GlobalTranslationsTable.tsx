import { SortState } from '@navikt/ds-react';
import { listSort } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalTranslationsContext } from '../../context/translations/GlobalTranslationsContext';
import TranslationTable from '../components/TranslationTable';

const GlobalTranslationsTable = () => {
  const [sortState, setSortState] = useState<SortState>();
  const { tag } = useParams();
  const { translationsPerTag } = useContext(GlobalTranslationsContext);

  const handleSort = (sortKey: string) => {
    setSortState((currentState) => {
      if (!currentState || sortKey !== currentState.orderBy) {
        return { orderBy: sortKey, direction: 'ascending' };
      } else {
        return currentState.direction === 'ascending' ? { orderBy: sortKey, direction: 'descending' } : undefined;
      }
    });
  };

  const sortedTranslationRows = useMemo<FormsApiGlobalTranslation[] | undefined>(() => {
    if (!tag || !translationsPerTag) {
      return undefined;
    }
    return translationsPerTag[tag].slice().sort(listSort.getLocaleComparator(sortState?.orderBy, sortState?.direction));
  }, [sortState, tag, translationsPerTag]);

  return (
    <TranslationTable
      rows={sortedTranslationRows}
      sortState={sortState}
      handleSort={handleSort}
      addNewRow={tag === 'skjematekster'}
    />
  );
};
export default GlobalTranslationsTable;

import { ReadMore } from '@navikt/ds-react';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import TranslationTable, { defaultColumns } from './TranslationTable';
import UnusedTranslationRow from './UnusedTranslationRow';
import { useStickyStyles } from './styles';

interface Props {
  translations?: FormsApiTranslation[];
  onRemove: (id: number) => Promise<void>;
  showKeys?: boolean;
}

const UnusedTranslations = ({ translations, onRemove, showKeys = false }: Props) => {
  const stickyStyles = useStickyStyles();
  const columns = showKeys ? [{ key: 'key', label: 'Nøkkel' }, ...defaultColumns] : defaultColumns;

  if (!translations || translations.length === 0) {
    return <></>;
  }

  return (
    <ReadMore header={`Se alle ubrukte oversettelser (${translations.length})`}>
      <TranslationTable
        columns={columns}
        actionColumn={{ key: 'deleteButton', label: '' }}
        stickyHeaderClassname={stickyStyles.unusedTranslations}
      >
        {translations.map((translation) => (
          <UnusedTranslationRow
            key={translation.key}
            translation={translation}
            onRemove={onRemove}
            showKey={showKeys}
          />
        ))}
      </TranslationTable>
    </ReadMore>
  );
};

export default UnusedTranslations;

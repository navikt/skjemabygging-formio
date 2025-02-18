import { ReadMore } from '@navikt/ds-react';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import TranslationTable from './TranslationTable';
import UnusedTranslationRow from './UnusedTranslationRow';

interface Props {
  translations?: FormsApiTranslation[];
  onRemove: (id: number) => Promise<void>;
}

const UnusedTranslations = ({ translations, onRemove }: Props) => {
  if (!translations || translations.length === 0) {
    return <></>;
  }

  return (
    <ReadMore header={`Se alle ubrukte oversettelser (${translations.length})`}>
      <TranslationTable actionColumn={{ key: 'deleteButton', label: '' }}>
        {translations.map((translation) => (
          <UnusedTranslationRow key={translation.key} translation={translation} onRemove={onRemove} />
        ))}
      </TranslationTable>
    </ReadMore>
  );
};

export default UnusedTranslations;

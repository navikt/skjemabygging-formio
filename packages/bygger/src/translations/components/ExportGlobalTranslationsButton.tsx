import { CSVLink } from 'react-csv';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import { getTranslationKeysForAllPredefinedTexts } from '../../old_translations/global/utils';
import { getHeadersForExport, getRowsForExport } from '../../old_translations/utils';

const ExportGlobalTranslationsButton = () => {
  const { translations } = useGlobalTranslations();

  const texts = getTranslationKeysForAllPredefinedTexts();
  const data = getRowsForExport(texts, translations);
  const headers = getHeadersForExport(translations);

  return (
    <CSVLink
      data={data}
      headers={headers}
      filename={'globale-oversettelser.csv'}
      className="navds-button navds-button--tertiary navds-button--small navds-label navds-label--small"
      separator={';'}
      enclosingCharacter={'"'}
    >
      Eksporter
    </CSVLink>
  );
};

export default ExportGlobalTranslationsButton;

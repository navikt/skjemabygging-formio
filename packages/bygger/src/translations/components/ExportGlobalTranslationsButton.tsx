import { CSVLink } from 'react-csv';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import { getHeadersForExport, getRowsForExportFromGlobalTexts } from '../utils/exportUtils';

const ExportGlobalTranslationsButton = () => {
  const { translations } = useGlobalTranslations();

  const data = getRowsForExportFromGlobalTexts(translations);
  const headers = getHeadersForExport(translations);

  return (
    <CSVLink
      data={data}
      headers={headers}
      filename={'globale-oversettelser.csv'}
      className="aksel-button aksel-button--tertiary aksel-button--small aksel-label aksel-label--small"
      separator={';'}
      enclosingCharacter={'"'}
    >
      Eksporter
    </CSVLink>
  );
};

export default ExportGlobalTranslationsButton;

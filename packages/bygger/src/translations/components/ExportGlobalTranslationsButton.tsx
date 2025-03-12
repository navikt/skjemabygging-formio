import { CSVLink } from 'react-csv';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import { getHeadersForExport, getRowsForExportFromGlobalTexts } from '../utils/exportTranslationsUtils';

const ExportGlobalTranslationsButton = () => {
  const { translations } = useGlobalTranslations();

  const data = getRowsForExportFromGlobalTexts(translations);
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

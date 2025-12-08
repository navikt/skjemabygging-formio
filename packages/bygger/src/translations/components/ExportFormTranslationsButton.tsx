import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { CSVLink } from 'react-csv';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { getHeadersForExport, getRowsForExportFromForm } from '../utils/exportUtils';

interface Props {
  form: Form;
}

const ExportFormTranslationsButton = ({ form }: Props) => {
  const { title, path } = form;
  const { translations } = useFormTranslations();

  return (
    <CSVLink
      data={getRowsForExportFromForm(form, translations)}
      filename={`${title}(${path})_Oversettelser.csv`}
      className="aksel-button aksel-button--tertiary aksel-button--small aksel-label aksel-label--small"
      separator={';'}
      headers={getHeadersForExport(translations)}
      enclosingCharacter={'"'}
    >
      Eksporter
    </CSVLink>
  );
};

export default ExportFormTranslationsButton;

import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { CSVLink } from 'react-csv';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { getHeadersForExport, getRowsForExport } from '../../old_translations/utils';

interface Props {
  form: Form;
}

const ExportFormTranslationsButton = ({ form }: Props) => {
  const { title, path } = form;
  const { translations } = useFormTranslations();

  return (
    <CSVLink
      data={getRowsForExport(form, translations)}
      filename={`${title}(${path})_Oversettelser.csv`}
      className="navds-button navds-button--tertiary navds-button--small navds-label navds-label--small"
      separator={';'}
      headers={getHeadersForExport(translations)}
      enclosingCharacter={'"'}
    >
      Eksporter
    </CSVLink>
  );
};

export default ExportFormTranslationsButton;

import {
  FormioTranslation,
  FormioTranslationMap,
  NavFormType,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { getTextsAndTranslationsForForm, getTextsAndTranslationsHeaders } from '../../old_translations/utils';
import { mapFormsApiTranslationsToScopedTranslationMap } from '../utils/translationsUtils';

interface Props {
  form: NavFormType;
}

const ExportFormTranslationsButton = ({ form }: Props) => {
  const { title, path } = form;
  const { translations } = useFormTranslations();

  const translationsFormioFormat: FormioTranslationMap = useMemo(() => {
    const languageCodes: TranslationLang[] = ['nn', 'en'];
    return Object.fromEntries(
      languageCodes.map((language) => {
        const formioTranslation: FormioTranslation = {
          id: 'id',
          translations: mapFormsApiTranslationsToScopedTranslationMap(translations, language),
        };
        return [language, formioTranslation];
      }),
    );
  }, [translations]);

  return (
    <CSVLink
      data={getTextsAndTranslationsForForm(form, translationsFormioFormat)}
      filename={`${title}(${path})_Oversettelser.csv`}
      className="navds-button navds-button--tertiary navds-button--small navds-label navds-label--small"
      separator={';'}
      headers={getTextsAndTranslationsHeaders(translationsFormioFormat)}
      enclosingCharacter={'"'}
    >
      Eksporter
    </CSVLink>
  );
};

export default ExportFormTranslationsButton;

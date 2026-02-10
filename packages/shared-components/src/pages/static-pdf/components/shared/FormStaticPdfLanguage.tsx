import { InlineMessage } from '@navikt/ds-react';
import { navFormUtils, TEXTS, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { useStaticPdf } from '../../StaticPdfContext';
import FormBox from './FormBox';
import FormRadio from './FormRadio';

interface Props {
  submissionPath: string;
  languageCode: TranslationLang;
}

const FormStaticPdfLanguage = ({ submissionPath, languageCode }: Props) => {
  const { form } = useForm();
  const { files } = useStaticPdf();
  const { translate } = useLanguages();

  const getLanguageLabel = (languageCode: string) => {
    switch (languageCode) {
      case 'nb':
        return TEXTS.statiske.staticPdf.languages.nb;
      case 'nn':
        return TEXTS.statiske.staticPdf.languages.nn;
      case 'en':
        return TEXTS.statiske.staticPdf.languages.en;
      case 'se':
        return TEXTS.statiske.staticPdf.languages.se;
      case 'fr':
        return TEXTS.statiske.staticPdf.languages.fr;
      default:
        return languageCode;
    }
  };

  const attachmentComponents = useMemo(() => {
    return navFormUtils
      .flattenComponents(form.components)
      .filter((component) => component.type === 'attachment' && component.properties?.vedleggskjema);
  }, [form]);

  const languages = useMemo(() => {
    return files
      .map((file) => ({
        label: getLanguageLabel(file.languageCode),
        value: file.languageCode,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [files]);

  return (
    <>
      {languages?.length > 1 && (
        <FormBox bottom="space-32">
          <FormRadio
            description={
              attachmentComponents.length > 0
                ? translate(TEXTS.statiske.staticPdf.selectLanguageDescription)
                : undefined
            }
            submissionPath={submissionPath}
            legend={TEXTS.statiske.staticPdf.selectLanguage}
            values={languages}
          />
        </FormBox>
      )}
      {languages?.length === 1 && languages[0].value !== languageCode && (
        <InlineMessage status="warning">
          {translate(TEXTS.statiske.staticPdf.selectLanguageMismatach, { language: translate(languages[0].label) })}
        </InlineMessage>
      )}
      {languages?.length === 0 && (
        <InlineMessage status="error">{translate(TEXTS.statiske.staticPdf.languageError)}</InlineMessage>
      )}
    </>
  );
};

export default FormStaticPdfLanguage;

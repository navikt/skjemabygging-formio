import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useStaticPdf } from '../../StaticPdfContext';
import FormBox from './FormBox';
import FormRadio from './FormRadio';

interface Props {
  submissionPath: string;
}

const FormStaticPdfLanguage = ({ submissionPath }: Props) => {
  const { files } = useStaticPdf();

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

  const languages = useMemo(() => {
    return files
      .map((file) => ({
        label: getLanguageLabel(file.languageCode),
        value: file.languageCode,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [files]);

  return (
    <FormBox bottom="space-32">
      <FormRadio submissionPath={submissionPath} legend={TEXTS.statiske.staticPdf.selectLanguage} values={languages} />
    </FormBox>
  );
};

export default FormStaticPdfLanguage;

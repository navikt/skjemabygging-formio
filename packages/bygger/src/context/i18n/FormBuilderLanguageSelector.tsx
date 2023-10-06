import {
  i18nData,
  LanguageSelector,
  makeStyles,
  useCurrentLanguage,
  useLanguageCodeFromURL,
} from '@navikt/skjemadigitalisering-shared-components';
import { Language, NavFormType, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';
import { languagesInNorwegian } from './index';

interface FormBuilderLanguageSelectorProps {
  languages: Language[];
  formPath: NavFormType['path'];
  languageSelectorLabel?: string;
  tag?: TranslationTag;
}

const useStyles = makeStyles({
  sideBarLanguageSelector: {
    margin: '0 auto 4rem',
  },
});

const FormBuilderLanguageSelector = ({
  languages,
  formPath,
  languageSelectorLabel,
  tag,
}: FormBuilderLanguageSelectorProps) => {
  const { currentLanguage } = useCurrentLanguage(useLanguageCodeFromURL(), i18nData);
  const supportedLanguageLists = (Object.keys(i18nData) as Language[]).filter(
    (languageCode) => languageCode !== 'nb-NO',
  );

  const styles = useStyles();

  const options = supportedLanguageLists
    .map((languageCode) => ({
      languageCode,
      optionLabel: `${languages.indexOf(languageCode) < 0 ? `Legg til ` : ''}${languagesInNorwegian[languageCode]}`,
      href: `/translations/${formPath}/${languageCode}${tag ? `/${tag}` : ''}`,
    }))
    .sort((lang1, lang2) =>
      lang1.optionLabel.startsWith('Legg til') ? 1 : lang2.optionLabel.startsWith('Legg til') ? -1 : 0,
    );

  const getLanguageSelectorLabel = () => {
    if (languageSelectorLabel) {
      return languageSelectorLabel;
    } else if (languagesInNorwegian[currentLanguage]) {
      return languagesInNorwegian[currentLanguage];
    } else {
      return 'Velg språk';
    }
  };

  return (
    <LanguageSelector className={styles.sideBarLanguageSelector} label={getLanguageSelectorLabel()} options={options} />
  );
};

export default FormBuilderLanguageSelector;

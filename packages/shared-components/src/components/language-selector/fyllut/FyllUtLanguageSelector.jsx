import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages/index';
import LanguageSelector from '../LanguageSelector';

export const languagesInOriginalLanguage = {
  'nb-NO': 'Norsk bokmål',
  'nn-NO': 'Norsk nynorsk',
  en: 'English',
  pl: 'Polskie',
};

const FyllUtLanguageSelector = () => {
  const { currentLanguage, availableLanguages, translate } = useLanguages();
  if (availableLanguages.length === 0) {
    return null;
  }

  if (currentLanguage !== 'nb-NO' && availableLanguages.indexOf('nb-NO') < 0) {
    availableLanguages.push('nb-NO');
  }

  const options = availableLanguages
    .filter((languageCode) => languageCode !== currentLanguage)
    .map((languageCode) => {
      const params = new URLSearchParams(window.location.search);
      params.set('lang', languageCode);
      return {
        languageCode,
        optionLabel: languagesInOriginalLanguage[languageCode],
        href: `?${params.toString()}`,
      };
    });

  const label = languagesInOriginalLanguage[currentLanguage]
    ? languagesInOriginalLanguage[currentLanguage]
    : 'Norsk bokmål';

  return options.length > 0 ? (
    <LanguageSelector
      label={label}
      ariaLabel={translate(TEXTS.grensesnitt.languageSelector.ariaLabel)}
      options={options}
    />
  ) : (
    <></>
  );
};

export default FyllUtLanguageSelector;

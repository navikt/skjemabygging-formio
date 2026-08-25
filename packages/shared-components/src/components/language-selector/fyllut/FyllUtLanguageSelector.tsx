import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages/index';
import LanguageSelector from '../LanguageSelector';

export const languagesInOriginalLanguage: Record<string, string> = {
  nb: 'Norsk bokmål',
  nn: 'Norsk nynorsk',
  en: 'English',
};

const FyllUtLanguageSelector = () => {
  const { currentLanguage, availableLanguages, translate } = useLanguages();
  if (availableLanguages.length === 0) {
    return null;
  }

  const languages =
    currentLanguage !== 'nb' && !availableLanguages.includes('nb') ? [...availableLanguages, 'nb'] : availableLanguages;

  const options = languages
    .filter((languageCode) => languageCode !== currentLanguage)
    .map((languageCode) => {
      const params = new URLSearchParams(window.location.search);
      params.set('lang', languageCode);
      return {
        languageCode,
        optionLabel: languagesInOriginalLanguage[languageCode] ?? languageCode,
        href: `?${params.toString()}`,
      };
    });

  const label = languagesInOriginalLanguage[currentLanguage] ?? 'Norsk bokmål';

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

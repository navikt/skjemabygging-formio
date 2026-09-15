import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import LanguageSelector from '../../components/language-selector/LanguageSelector';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './FormLanguageSelector.module.css';

const languagesInOriginalLanguage: Record<string, string> = {
  nb: 'Norsk bokmål',
  nn: 'Norsk nynorsk',
  en: 'English',
  pl: 'Polskie',
};
const FormLanguageSelector = () => {
  const { currentLanguage, availableLanguages, translate } = useLanguage();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();

  const supportedLanguages = useMemo(() => {
    const languages = [...availableLanguages];

    if (currentLanguage !== 'nb' && !languages.includes('nb')) {
      languages.push('nb');
    }

    return languages;
  }, [availableLanguages, currentLanguage]);

  const options = useMemo(
    () =>
      supportedLanguages.map((languageCode) => ({
        value: languageCode,
        label: languagesInOriginalLanguage[languageCode] ?? languageCode,
        language: languageCode,
      })),
    [supportedLanguages],
  );

  return (
    <div className={styles.container}>
      <LanguageSelector
        ariaLabel={translate(TEXTS.grensesnitt.languageSelector.ariaLabel)}
        currentLanguage={currentLanguage}
        label={languagesInOriginalLanguage[currentLanguage] ?? 'Norsk bokmål'}
        options={options}
        onChange={(language) => {
          const params = new URLSearchParams(search);
          params.set('lang', language);
          navigate({ pathname, search: `?${params.toString()}` }, { state });
        }}
      />
    </div>
  );
};

export default FormLanguageSelector;

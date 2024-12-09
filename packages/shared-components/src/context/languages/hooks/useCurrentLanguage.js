import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';

const defaultLanguage = 'nb-NO';

const useCurrentLanguage = (languageCodeFromUrl, translations) => {
  const language = localizationUtils.getLanguageFromIso639_1(languageCodeFromUrl);
  const initialLanguage = useRef(Object.keys(translations).indexOf(language) !== -1 ? language : defaultLanguage);

  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage.current);

  useEffect(() => {
    if (language) {
      setCurrentLanguage(language);
    } else {
      setCurrentLanguage(initialLanguage.current);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return { currentLanguage, initialLanguage };
};

export default useCurrentLanguage;

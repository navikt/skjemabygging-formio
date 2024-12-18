import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';

const defaultLanguage = 'nb-NO';

const useCurrentLanguage = (languageCode: string | undefined, translations: object) => {
  const language = localizationUtils.getLanguageFromIso639_1(languageCode);
  const initialLanguage = useRef(Object.keys(translations).indexOf(language) !== -1 ? language : defaultLanguage);

  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage.current);

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

  return { currentLanguage, setCurrentLanguage };
};

export default useCurrentLanguage;

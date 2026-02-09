import { useEffect, useMemo } from 'react';

const defaultLanguage = 'nb-NO';

const useCurrentLanguage = (languageCodeFromUrl, translations) => {
  const initialLanguage = useMemo(
    () => (Object.keys(translations).includes(languageCodeFromUrl) ? languageCodeFromUrl : defaultLanguage),
    [languageCodeFromUrl, translations],
  );

  const currentLanguage = useMemo(() => {
    if (languageCodeFromUrl && Object.keys(translations).includes(languageCodeFromUrl)) {
      return languageCodeFromUrl;
    }
    return initialLanguage;
  }, [languageCodeFromUrl, translations]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return { currentLanguage, initialLanguage };
};

export default useCurrentLanguage;

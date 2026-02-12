import { useEffect, useMemo } from 'react';

const defaultLanguage = 'nb-NO';

const useCurrentLanguage = (languageCodeFromUrl, translations) => {
  const initialLanguage = useMemo(
    () => (Object.keys(translations).indexOf(languageCodeFromUrl) !== -1 ? languageCodeFromUrl : defaultLanguage),
    [languageCodeFromUrl, translations],
  );

  const currentLanguage = languageCodeFromUrl || initialLanguage;

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return { currentLanguage, initialLanguage };
};

export default useCurrentLanguage;

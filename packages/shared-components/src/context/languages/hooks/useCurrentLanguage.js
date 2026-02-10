import { useEffect, useState } from 'react';

const defaultLanguage = 'nb-NO';

const useCurrentLanguage = (languageCodeFromUrl, translations) => {
  const [initialLanguage] = useState(() =>
    Object.keys(translations).indexOf(languageCodeFromUrl) !== -1 ? languageCodeFromUrl : defaultLanguage,
  );

  const currentLanguage = languageCodeFromUrl || initialLanguage;

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return { currentLanguage, initialLanguage };
};

export default useCurrentLanguage;

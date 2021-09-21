import { useEffect, useRef, useState } from "react";

const defaultLanguage = "nb-NO";

const useCurrentLanguage = (languageCodeFromUrl, translations) => {
  const initialLanguage = useRef(
    Object.keys(translations).indexOf(languageCodeFromUrl) !== -1 ? languageCodeFromUrl : defaultLanguage
  );

  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage.current);

  useEffect(() => {
    if (languageCodeFromUrl) {
      setCurrentLanguage(languageCodeFromUrl);
    } else {
      setCurrentLanguage(initialLanguage.current);
    }
  }, [languageCodeFromUrl]);

  return { currentLanguage, initialLanguage };
};

export default useCurrentLanguage;

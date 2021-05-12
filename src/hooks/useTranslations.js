import { useEffect, useState } from "react";

const useTranslations = (languageCode, allTranslations) => {
  const [currentTranslation, setCurrentTranslation] = useState({});

  useEffect(() => {
    const newTranslation = allTranslations.resources[languageCode]
      ? allTranslations.resources[languageCode].translation
      : {};
    setCurrentTranslation(newTranslation);
  }, [languageCode, allTranslations]);

  function translate(originalText) {
    return currentTranslation[originalText] || originalText;
  }

  return translate;
};

export default useTranslations;

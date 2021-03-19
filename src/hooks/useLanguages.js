import { useHistory } from "react-router-dom";
import { useEffect, useRef } from "react";

export const supportedLanguages = ["nb-NO", "nn-NO", "en", "pl"];
export const languagesInNorwegian = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Norsk bokmål",
};
export const languagesInOriginalLanguage = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "English",
  pl: "Polskie",
};

const useLanguages = () => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const currentLanguage = params.get("lang");
  const initialLanguage = useRef(currentLanguage || "nb-NO");
  useEffect(() => {
    if (window.setLanguage !== undefined && currentLanguage) {
      window.setLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    initialLanguage,
  };
};

export default useLanguages;

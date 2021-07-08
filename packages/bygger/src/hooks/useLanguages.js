import { useHistory } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export const supportedLanguages = ["nb-NO", "nn-NO", "en", "pl"];
export const languagesInNorwegian = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const useLanguages = () => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const langQueryParam = params.get("lang");
  // useRef does not change on re-runs, so this just uses the language set when loading the app,
  // either by setting the lang query param or defaulting to bokmal (nb-NO)
  const initialLanguage = useRef(
    langQueryParam && supportedLanguages.indexOf(langQueryParam) !== -1 ? langQueryParam : "nb-NO"
  );
  const [currentLanguage, setCurrentLanguage] = useState("nb-NO");

  useEffect(() => {
    if (langQueryParam && supportedLanguages.indexOf(langQueryParam) !== -1) {
      setCurrentLanguage(langQueryParam);
    }
  }, [langQueryParam, setCurrentLanguage]);

  return {
    currentLanguage,
    initialLanguage,
  };
};

export default useLanguages;

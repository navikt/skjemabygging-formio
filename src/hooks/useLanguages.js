import { useHistory } from "react-router-dom";
import { useEffect, useRef } from "react";

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

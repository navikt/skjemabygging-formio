import { useHistory, useLocation } from "react-router-dom";
import { useEffect } from "react";

const useRedirectIfNoLanguageCode = (languageCode, translations) => {
  const history = useHistory();
  const location = useLocation();
  useEffect(() => {
    if (!languageCode) {
      const firstAvailableLanguageCode = Object.keys(translations)[0];
      if (translations["nn-NO"]) {
        history.push(`${location.pathname}/nn-NO`);
      } else if (firstAvailableLanguageCode) {
        history.push(`${location.pathname}/${firstAvailableLanguageCode}`);
      }
    }
  }, [history, languageCode, location.pathname, translations]);
};

export default useRedirectIfNoLanguageCode;

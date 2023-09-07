import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const useRedirectIfNoLanguageCode = (languageCode, translations) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!languageCode) {
      const firstAvailableLanguageCode = Object.keys(translations)[0];
      if (translations["nn-NO"]) {
        navigate(`${location.pathname}/nn-NO`);
      } else if (firstAvailableLanguageCode) {
        navigate(`${location.pathname}/${firstAvailableLanguageCode}`);
      }
    }
  }, [navigate, languageCode, location.pathname, translations]);
};

export default useRedirectIfNoLanguageCode;

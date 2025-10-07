import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

const useRedirectIfNoLanguageCode = (languageCode, translations) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!languageCode) {
      const firstAvailableLanguageCode = Object.keys(translations)[0];
      if (translations['nn-NO']) {
        navigate(`${location.pathname}/nn-NO`, { replace: true });
      } else if (firstAvailableLanguageCode) {
        navigate(`${location.pathname}/${firstAvailableLanguageCode}`, { replace: true });
      }
    }
  }, [navigate, languageCode, location.pathname, translations]);
};

export default useRedirectIfNoLanguageCode;

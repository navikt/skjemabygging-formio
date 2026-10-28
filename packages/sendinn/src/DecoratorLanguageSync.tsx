import { onLanguageSelect, setParams } from '@navikt/nav-dekoratoren-moduler';
import { sendinnLanguageUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Connects the decorator's language menu to the lang query parameter. The backend renders the decorator
 * in the selected language, so this only handles changes after the page has loaded.
 */
const DecoratorLanguageSync = () => {
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const language = sendinnLanguageUtils.getSelectedLanguage(new URLSearchParams(search));

  useEffect(() => {
    onLanguageSelect(({ locale }) => {
      const searchParams = new URLSearchParams(search);
      searchParams.set('lang', locale);
      navigate({ pathname, search: `?${searchParams}` }, { state });
    });
  }, [navigate, pathname, search, state]);

  // Keeps the menu in sync when lang changes without the menu, for example with the back button.
  useEffect(() => {
    setParams({ language });
  }, [language]);

  return null;
};

export { DecoratorLanguageSync };

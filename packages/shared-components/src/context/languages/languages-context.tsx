import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { I18nTranslationReplacements, translationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useCurrentLanguage from './hooks/useCurrentLanguage';
import useLanguageCodeFromURL from './hooks/useLanguageCodeFromURL';

interface LanguageContextType {
  availableLanguages: string[];
  currentLanguage: string;
  initialLanguage: string;
  translate: (originalText: string | undefined, params?: Record<string | number, any>) => string;
  translationsForNavForm: object;
}

type CurrentLanguageType = {
  currentLanguage: string;
  initialLanguage: string;
};

const LanguagesContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguagesProvider = ({ children, translations }) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState<object>({});
  const location = useLocation();
  const navigate = useNavigate();

  const languageCodeFromUrl: string = useLanguageCodeFromURL() ?? 'nb';
  const { currentLanguage, initialLanguage } = useCurrentLanguage(
    languageCodeFromUrl,
    translations,
  ) as unknown as CurrentLanguageType;

  useEffect(() => {
    setAvailableLanguages(Object.keys(translations));
  }, [translations]);

  useEffect(() => {
    setTranslationsForNavForm(translations);
  }, [translations]);

  useEffect(() => {
    onLanguageSelect((language) => {
      navigate(`${location.pathname.replace(`/${languageCodeFromUrl}`, '')}/${language.locale}${location.search}`, {
        replace: true,
      });
    });
  }, [location, languageCodeFromUrl, navigate]);

  const translate = (originalText: string = '', params?: I18nTranslationReplacements): string => {
    return translationUtils.translateWithTextReplacements({
      originalText,
      params,
      translations,
      currentLanguage,
    });
  };

  return (
    <LanguagesContext.Provider
      value={{
        availableLanguages,
        currentLanguage,
        initialLanguage,
        translate,
        translationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);

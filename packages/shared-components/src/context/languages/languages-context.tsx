import { createContext, useContext, useEffect, useState } from 'react';
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

  const languageCodeFromUrl: string = useLanguageCodeFromURL() ?? 'nb-NO';
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

  function translate(originalText: string = '', params?: Record<string | number, any>): string {
    const currentTranslation = translations[currentLanguage];
    return currentTranslation && currentTranslation[originalText]
      ? injectParams(currentTranslation[originalText], params)
      : injectParams(originalText, params);
  }

  const injectParams = (template, params) => {
    if (template && params) {
      return template.replace(/{{2}([^{}]*)}{2}/g, (match, $1) => translate(params[$1]) || match);
    }
    return template;
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

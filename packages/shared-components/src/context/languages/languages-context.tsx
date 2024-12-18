import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { I18nTranslationReplacements, translationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useCurrentLanguage from './hooks/useCurrentLanguage';

interface LanguageContextType {
  availableLanguages: string[];
  currentLanguage: string;
  translate: (originalText: string | undefined, params?: Record<string | number, any>) => string;
  translationsForNavForm: object;
  setCurrentLanguage: Dispatch<string>;
}

const LanguagesContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguagesProvider = ({ children, translations, languageCode = 'nb' }) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState<object>({});
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const { currentLanguage, setCurrentLanguage } = useCurrentLanguage(languageCode, translations);

  useEffect(() => {
    setAvailableLanguages(Object.keys(translations));
  }, [translations]);

  useEffect(() => {
    setTranslationsForNavForm(translations);
  }, [translations]);

  useEffect(() => {
    onLanguageSelect((language) => {
      const locale = language.locale !== 'nb' ? `/${language.locale}` : '';
      const rest = params['*'] ? `/${params['*']}` : '';
      const search = searchParams.size > 0 ? `?${searchParams.toString()}` : '';

      navigate(`${params.formPath}${locale}${rest}${search}`, { replace: true });
    });
  }, [searchParams, languageCode, navigate, params]);

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
        translate,
        translationsForNavForm,
        setCurrentLanguage,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);

import {
  FormsApiTranslationMap,
  formsApiTranslationUtils,
  TranslateFunction,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';

interface LanguageContextValue {
  translate: TranslateFunction;
  currentLanguage: TranslationLang;
  availableLanguages: TranslationLang[];
}

interface LanguageConfig extends Omit<LanguageContextValue, 'translate'> {
  translations: FormsApiTranslationMap;
}

interface Props extends LanguageConfig {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextValue>({
  translate: (text) => text ?? '',
  currentLanguage: 'nb',
  availableLanguages: [],
});

const LanguageProvider = ({ children, translations, currentLanguage, availableLanguages }: Props) => {
  const translate = useMemo(
    () => formsApiTranslationUtils.createTranslate(translations, currentLanguage),
    [currentLanguage, translations],
  );

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ translate, currentLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => useContext(LanguageContext);

export { LanguageProvider, useLanguage };
export type { LanguageConfig, LanguageContextValue };

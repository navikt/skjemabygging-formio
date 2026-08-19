import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

interface LanguageContextValue {
  translate: TranslateFunction;
  currentLanguage: string;
  availableLanguages: string[];
}

interface Props extends Omit<LanguageContextValue, 'availableLanguages'> {
  children: ReactNode;
  availableLanguages?: string[];
}

const LanguageContext = createContext<LanguageContextValue>({
  translate: (text) => text ?? '',
  currentLanguage: '',
  availableLanguages: [],
});

const LanguageProvider = ({ children, translate, currentLanguage, availableLanguages = [] }: Props) => {
  return (
    <LanguageContext.Provider value={{ translate, currentLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => useContext(LanguageContext);

export { LanguageProvider, useLanguage };
export type { LanguageContextValue };

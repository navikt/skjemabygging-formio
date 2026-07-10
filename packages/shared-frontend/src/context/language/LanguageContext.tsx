import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

interface FrameworkLanguage {
  translate: TranslateFunction;
  currentLanguage: string;
}

interface Props extends FrameworkLanguage {
  children: ReactNode;
}

const LanguageContext = createContext<FrameworkLanguage>({
  translate: (text) => text ?? '',
  currentLanguage: '',
});

const LanguageProvider = ({ children, translate, currentLanguage }: Props) => {
  return <LanguageContext.Provider value={{ translate, currentLanguage }}>{children}</LanguageContext.Provider>;
};

const useLanguage = () => useContext(LanguageContext);

export { LanguageProvider, useLanguage };
export type { FrameworkLanguage };

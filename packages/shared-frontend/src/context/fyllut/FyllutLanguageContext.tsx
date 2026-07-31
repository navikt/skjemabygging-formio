import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

interface FyllutLanguage {
  availableLanguages: string[];
  currentLanguage: string;
  translate: TranslateFunction;
}

interface Props {
  children: ReactNode;
  value: FyllutLanguage;
}

const FyllutLanguageContext = createContext<FyllutLanguage>({
  availableLanguages: [],
  currentLanguage: '',
  translate: (text) => text ?? '',
});

const FyllutLanguageProvider = ({ children, value }: Props) => (
  <FyllutLanguageContext.Provider value={value}>{children}</FyllutLanguageContext.Provider>
);

const useFyllutLanguage = () => useContext(FyllutLanguageContext);

export { FyllutLanguageProvider, useFyllutLanguage };
export type { FyllutLanguage };

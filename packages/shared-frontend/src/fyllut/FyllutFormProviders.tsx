import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { ReactNode } from 'react';
import { LanguageContextValue, LanguageProvider } from '../context/language/LanguageContext';
import { FyllutContextValue, FyllutProvider } from './FyllutContext';

interface Props {
  children: ReactNode;
  fyllut: FyllutContextValue;
  language: LanguageContextValue;
}

const getAkselLocale = (language: string) => (language.startsWith('en') ? en : language.startsWith('nn') ? nn : nb);

const FyllutFormProviders = ({ children, fyllut, language }: Props) => (
  <FyllutProvider value={fyllut}>
    <LanguageProvider
      translate={language.translate}
      currentLanguage={language.currentLanguage}
      availableLanguages={language.availableLanguages}
    >
      <AkselProvider locale={getAkselLocale(language.currentLanguage)}>{children}</AkselProvider>
    </LanguageProvider>
  </FyllutProvider>
);

export default FyllutFormProviders;

import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { ReactNode } from 'react';
import { DevtoolsProvider } from '../../context/devtools/DevtoolsContext';
import { DevtoolsConnection } from '../../context/devtools/devtoolsSession';
import { LanguageConfig, LanguageProvider } from '../../context/language/LanguageContext';
import { RuntimeServices, RuntimeServicesProvider } from '../../context/runtime-services/RuntimeServicesContext';
import { IntegrationContextValue, IntegrationProvider } from '../context/integration/IntegrationContext';

interface Props {
  children: ReactNode;
  devtools?: DevtoolsConnection;
  integration: IntegrationContextValue;
  language: LanguageConfig;
  services: RuntimeServices;
}

const getAkselLocale = (language: string) => (language.startsWith('en') ? en : language.startsWith('nn') ? nn : nb);

const FyllutFormProviders = ({ children, devtools, integration, language, services }: Props) => (
  <DevtoolsProvider connection={devtools}>
    <RuntimeServicesProvider services={services}>
      <IntegrationProvider value={integration}>
        <LanguageProvider
          translations={language.translations}
          currentLanguage={language.currentLanguage}
          availableLanguages={language.availableLanguages}
        >
          <AkselProvider locale={getAkselLocale(language.currentLanguage)}>{children}</AkselProvider>
        </LanguageProvider>
      </IntegrationProvider>
    </RuntimeServicesProvider>
  </DevtoolsProvider>
);

export default FyllutFormProviders;

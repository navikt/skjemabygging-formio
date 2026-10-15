import '@navikt/ds-css/dist/index.css';
import { Theme } from '@navikt/ds-react';
import { SharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import {
  AppConfigProvider,
  ErrorPage,
  http,
  LanguageProvider,
  SendinnApp,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

const baseUrl = '/sendinn';
const root = createRoot(document.getElementById('root')!);

const renderApp = (config: SharedFrontendConfig) =>
  root.render(
    <StrictMode>
      <Theme theme="light">
        <BrowserRouter basename={baseUrl}>
          <AppConfigProvider baseUrl={baseUrl} config={config}>
            <SendinnApp />
          </AppConfigProvider>
        </BrowserRouter>
      </Theme>
    </StrictMode>,
  );

// Config loading failed, so there are no translations either. The error page falls back to nb.
const renderBootstrapError = () =>
  root.render(
    <StrictMode>
      <Theme theme="light">
        <LanguageProvider translations={{}} currentLanguage="nb" availableLanguages={['nb']}>
          <ErrorPage />
        </LanguageProvider>
      </Theme>
    </StrictMode>,
  );

http
  .get<SharedFrontendConfig>(`${baseUrl}/api/config`)
  .then(renderApp)
  .catch((error) => {
    console.error(`Could not fetch config from server: ${error}`);
    renderBootstrapError();
  });

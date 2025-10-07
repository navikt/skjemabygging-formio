import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { Settings } from 'luxon';
import Pusher from 'pusher-js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './context/auth-context';
import httpBygger from './util/httpBygger';

const dokumentinnsendingDevURL = 'https://tjenester-q0.nav.no/dokumentinnsending';

Pusher.logToConsole = true;
Settings.defaultZone = 'Europe/Oslo';

fetch('/api/config')
  .then((res) => {
    return res.json();
  })
  .then((config) => renderReact(config));

const renderReact = (config) => {
  const root = createRoot(document.getElementById('root')!);

  root.render(
    <StrictMode>
      <BrowserRouter>
        <AppConfigProvider
          dokumentinnsendingBaseURL={dokumentinnsendingDevURL}
          fyllutBaseURL={config.fyllutBaseUrl}
          featureToggles={config.featureToggles}
          config={config}
          app="bygger"
          http={httpBygger}
        >
          <AuthProvider user={config.user}>
            <App serverURL={config.fyllutBaseUrl} />
          </AuthProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </StrictMode>,
  );
};

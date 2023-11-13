import { AppConfigProvider, url } from '@navikt/skjemadigitalisering-shared-components';
import { ConfigType } from '@navikt/skjemadigitalisering-shared-domain';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ConfirmDelingslenkeModal from './components/ConfirmDelingslenkeModal';
import getDokumentinnsendingBaseURL from './getDokumentinnsendingBaseURL';
import httpFyllut from './util/httpFyllut';

let featureToggles = {};

const subissionMethod = url.getUrlParam(window.location.search, 'sub');

httpFyllut
  .get<ConfigType>('/fyllut/api/config')
  .then((json) => {
    if (json.FEATURE_TOGGLES) {
      featureToggles = json.FEATURE_TOGGLES;
    }
    renderReact(getDokumentinnsendingBaseURL(json.NAIS_CLUSTER_NAME), json);
  })
  .catch((error) => {
    console.error(`Could not fetch config from server: ${error}`);
  });

const renderReact = (dokumentInnsendingBaseURL, config) => {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <BrowserRouter basename="/fyllut">
        <AppConfigProvider
          dokumentinnsendingBaseURL={dokumentInnsendingBaseURL}
          featureToggles={featureToggles}
          baseUrl={'/fyllut'}
          fyllutBaseURL={'/fyllut'}
          submissionMethod={subissionMethod}
          app="fyllut"
          config={config}
          http={httpFyllut}
          enableFrontendLogger
        >
          {config.isDelingslenke && <ConfirmDelingslenkeModal />}
          <App />
        </AppConfigProvider>
      </BrowserRouter>
    </StrictMode>,
  );
};

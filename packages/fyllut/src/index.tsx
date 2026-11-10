import { AppConfigProvider as LegacyAppConfigProvider, url } from '@navikt/skjemadigitalisering-shared-components';
import { FyllutFrontendConfig, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-frontend';
import { Settings } from 'luxon';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import ConfirmDelingslenkeModal from './components/ConfirmDelingslenkeModal';
import { FyllutAppProvider } from './context/FyllutAppProvider';
import getDokumentinnsendingBaseURL from './util/getDokumentinnsendingBaseURL';
import httpFyllut from './util/httpFyllut';

const baseUrl = '/fyllut';
let featureToggles = {};

const subissionMethod = url.getUrlParam(window.location.search, 'sub') as SubmissionMethod;
Settings.defaultZone = 'Europe/Oslo';

httpFyllut
  .get<FyllutFrontendConfig>(`${baseUrl}/api/config`)
  .then((json) => {
    featureToggles = json.featureToggles ?? json.FEATURE_TOGGLES ?? {};
    renderReact(getDokumentinnsendingBaseURL(json.NAIS_CLUSTER_NAME), json);
  })
  .catch((error) => {
    console.error(`Could not fetch config from server: ${error}`);
  });

const renderReact = (dokumentInnsendingBaseURL: string, config: FyllutFrontendConfig) => {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <BrowserRouter basename={baseUrl}>
        <AppConfigProvider baseUrl={baseUrl} config={config} http={httpFyllut}>
          <FyllutAppProvider submissionMethod={subissionMethod}>
            {/* Used by the legacy renderer and fyllut pages that still read the legacy config */}
            <LegacyAppConfigProvider
              dokumentinnsendingBaseURL={dokumentInnsendingBaseURL}
              featureToggles={featureToggles}
              baseUrl={baseUrl}
              fyllutBaseURL={baseUrl}
              submissionMethod={subissionMethod}
              app="fyllut"
              config={{ ...config }}
              http={httpFyllut}
            >
              {config.isDelingslenke && <ConfirmDelingslenkeModal />}
              <App />
            </LegacyAppConfigProvider>
          </FyllutAppProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </StrictMode>,
  );
};

import { AppConfigProvider, Modal } from '@navikt/skjemadigitalisering-shared-components';
import Pusher from 'pusher-js';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/auth-context';

const dokumentinnsendingDevURL = 'https://tjenester-q0.nav.no/dokumentinnsending';

Pusher.logToConsole = true;

// @ts-ignore
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root');

fetch('/api/config')
  .then((res) => {
    const token = res.headers.get('Bygger-Formio-Token');
    if (token) {
      localStorage.setItem('formioToken', token);
    }
    return res.json();
  })
  .then((config) => renderReact(config));

const renderReact = (config) => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppConfigProvider
          dokumentinnsendingBaseURL={dokumentinnsendingDevURL}
          fyllutBaseURL={config.fyllutBaseUrl}
          featureToggles={config.featureToggles}
          config={config}
          app="bygger"
        >
          <AuthProvider user={config.user}>
            <App projectURL={config.formioProjectUrl} serverURL={config.fyllutBaseUrl} />
          </AuthProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
  );
};

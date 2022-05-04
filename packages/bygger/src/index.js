import { AppConfigProvider, Template as navdesign } from "@navikt/skjemadigitalisering-shared-components";
import { Formio } from "formiojs";
import Pusher from "pusher-js";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/auth-context";
import featureToggles from "./featureToggles.js";
import "./index.less";
import * as serviceWorker from "./serviceWorker";

Formio.use(navdesign);

const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";

Pusher.logToConsole = true;

fetch("/api/config")
  .then((res) => res.json())
  .then((config) => renderReact(config));

const renderReact = (config) => {
  const pusher = new Pusher(config.pusherKey, {
    cluster: config.pusherCluster,
  });
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppConfigProvider
          dokumentinnsendingBaseURL={dokumentinnsendingDevURL}
          fyllutBaseURL={config.fyllutBaseUrl}
          featureToggles={featureToggles}
        >
          <AuthProvider>
            <App projectURL={config.formioProjectUrl} serverURL={config.fyllutBaseUrl} pusher={pusher} />
          </AuthProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
